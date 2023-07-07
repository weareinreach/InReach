/* eslint-disable node/no-process-env */
import { geojsonToWKT } from '@terraformer/wkt'
import { getDiff } from 'json-difference'
import { diff } from 'just-diff'
import { diffApply } from 'just-diff-apply'
import filterObject from 'just-filter-object'
import omit from 'just-omit'
import pick from 'just-pick'
import sortArray from 'just-sort-by'
import parsePhoneNumber, { type PhoneNumber } from 'libphonenumber-js/max'
import superjson from 'superjson'
import { type SuperJSONResult } from 'superjson/dist/types'
import { ZodError } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { createPoint } from '~db/lib/createPoint'
import { generateId } from '~db/lib/idGen'
import { slugUpdate } from '~db/lib/slugGen'
import { InputJsonValue } from '~db/lib/zod'
import { organizationsSchema } from '~db/seed/recon/input/types'
import { needsUpdate } from '~db/seed/recon/lib/compare'
import {
	attribsToNotDelete,
	dataCorrections,
	existing,
	getCountryId,
	getGovDistId,
} from '~db/seed/recon/lib/existing'
import { attachLogger, formatMessage } from '~db/seed/recon/lib/logger'
import { create, crowdin, deleteRecord, exceptions, update, writeBatches } from '~db/seed/recon/lib/output'
import { generateFreeTextKey } from '~db/seed/recon/lib/translations'
import { type ListrJob } from '~db/seed/recon/lib/types'
import { conditionalObj, emptyStrToNull, raise, trimSpaces } from '~db/seed/recon/lib/utils'
// import { parseSchedule } from '~db/seed/recon/parsers/hours'
import { type AttrSupp, generateSupplementTxn, tagParser } from '~db/seed/recon/parsers/attributes'
import { JsonInputOrNull } from '~db/zod_util/prismaJson'

const washdcRegex = /washington.*dc/i
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject<T> = T extends Map<any, any> | Set<any> | null ? never : T extends object ? T : never
const filterUndefined = <T extends Record<string, unknown>>(obj: PlainObject<T>) =>
	filterObject<T>(obj, (_k, v) => v !== undefined)
const filterUndefinedOrNull = <T extends Record<string, unknown>>(obj: PlainObject<T>) =>
	filterObject<T>(obj, (_k, v) => v !== undefined && v !== null)
export const orgRecon = {
	title: 'Reconcile Organizations',
	// skip: true,
	options: { bottomBar: false },
	task: async (_ctx, task) => {
		attachLogger(task)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		const logUpdate = (field: string, from: unknown, to: unknown) =>
			log(
				`Updating ${field} from ${
					typeof from === 'object' ? '\n' + JSON.stringify(from, null, 1) + '\n' : `"${from}"`
				} to ${typeof to === 'object' ? '\n' + JSON.stringify(to, null, 1) : `"${to}"`}`,
				'update',
				true
			)

		const logAddition = (table: string, value: unknown) =>
			log(
				`Adding ${
					typeof value === 'object' ? '\n' + JSON.stringify(value, null, 1) + '\n' : `"${value}"`
				} to ${table}`,
				'create',
				true
			)

		const logDeletion = (table: string, value: unknown) =>
			log(`Deleting ${value} from ${table}`, 'trash', true)

		writeBatches(task, true)
		let orgCounter = 1

		// read input file
		const orgs = organizationsSchema
			.array()
			.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, './input/existingOrgs.json'), 'utf-8')))
		log(`Organizations to process: ${orgs.length}`, 'info')

		// get System userId for audit log
		const { id: actorId } = await prisma.user.findUniqueOrThrow({
			where: { email: 'inreach_svc@inreach.org' },
			select: { id: true },
		})

		// start loop
		for (const org of orgs) {
			task.title = `Reconcile Organizations [${orgCounter}/${orgs.length}]`
			log(`[${orgCounter}/${orgs.length}] Reconciling Organization: ${org.name}`, 'info')
			const createdAt = org.created_at.$date
			const updatedAt = org.updated_at.$date
			const organizationId = existing.orgId.get(org._id.$oid)
			if (!organizationId) {
				log(`Organization not found: ${org._id.$oid}`, 'error')
				throw new Error('Organization not found', { cause: org._id.$oid })
			}
			const genAuditUpdate = (
				from: Record<string, unknown>,
				to: Record<string, unknown>,
				links: AuditLogLinks
			) => {
				const changedFields = pick(from, Object.keys(to))
				try {
					const serializedFrom = superjson.serialize(changedFields)
					const serializedTo = superjson.serialize(to)
					create.auditLog.add({
						actorId,
						operation: 'UPDATE',
						from: JsonInputOrNull.parse(serializedFrom),
						to: JsonInputOrNull.parse(serializedTo),
						organizationId,
						...links,
					})
				} catch (err) {
					if (err instanceof ZodError) {
						const flattened = err.flatten()
						task.output = JSON.stringify(flattened, null, 2)
					}
					throw err
				}
			}
			const genAuditCreate = (to: unknown, links: AuditLogLinks) => {
				create.auditLog.add({
					actorId,
					operation: 'CREATE',
					to: InputJsonValue.parse(superjson.serialize(to)),
					organizationId,
					...links,
				})
			}
			const genAuditLink = (links: AuditLogLinks) => {
				create.auditLog.add({
					actorId,
					to: InputJsonValue.parse(superjson.serialize(links)),
					operation: 'LINK',
					...links,
				})
			}

			/**
			 * .
			 *
			 * === Update basic org fields ===
			 *
			 * .
			 */
			// #region Organization basics
			const existingOrgRecord = await prisma.organization.findUniqueOrThrow({
				where: { id: organizationId },
				include: { description: { include: { tsKey: true } } },
			})
			const updateOrgRecord: Prisma.OrganizationUpdateArgs = {
				where: { id: organizationId },
				data: {},
			}

			if (needsUpdate(existingOrgRecord.name, trimSpaces(org.name))) {
				logUpdate('name', existingOrgRecord.name, trimSpaces(org.name))
				updateOrgRecord.data.name = trimSpaces(org.name)

				const newSlug = await slugUpdate(
					{ name: trimSpaces(org.name) as string, id: existingOrgRecord.id, slug: existingOrgRecord.slug },
					existing.orgSlug
				)
				if (newSlug !== existingOrgRecord.slug) {
					logUpdate('slug', existingOrgRecord.slug, newSlug)
					updateOrgRecord.data.slug = newSlug
					const slugRedirect: Prisma.SlugRedirectCreateManyInput = {
						id: generateId('slugRedirect'),
						from: existingOrgRecord.slug,
						to: newSlug,
						orgId: existingOrgRecord.id,
					}
					create.slugRedirect.add(slugRedirect)
					genAuditCreate(slugRedirect, { slugRedirectId: slugRedirect.id })
				}
			}
			if (
				existingOrgRecord.description &&
				needsUpdate(existingOrgRecord.description.tsKey.text, org.description)
			) {
				logUpdate('description', existingOrgRecord.description.tsKey.text, trimSpaces(org.description ?? ''))
				if (org.description && existingOrgRecord.description.tsKey.crowdinId)
					crowdin.update.add({
						id: existingOrgRecord.description.tsKey.crowdinId,
						text: trimSpaces(org.description),
					})
				update.translationKey.add({
					where: { ns_key: { ns: namespace.orgData, key: existingOrgRecord.description.key } },
					data: { text: org.description ? trimSpaces(org.description) : undefined },
				})
				genAuditUpdate(
					{ text: existingOrgRecord.description.tsKey.text },
					{ text: org.description ? trimSpaces(org.description) : undefined },
					{ translationKey: existingOrgRecord.description.key, translationNs: namespace.orgData }
				)
			}
			if (needsUpdate(existingOrgRecord.deleted, org.is_deleted)) {
				logUpdate('deleted', existingOrgRecord.deleted, org.is_deleted)
				updateOrgRecord.data.deleted = org.is_deleted
			}
			if (needsUpdate(existingOrgRecord.published, org.is_published)) {
				if (org.is_published === true) {
					log(`SKIPPING - Mark organization as published`, 'skip', true)
				} else {
					logUpdate('published', existingOrgRecord.published, org.is_published)
					updateOrgRecord.data.published = org.is_published
				}
			}
			if (org.verified_at?.$date && needsUpdate(existingOrgRecord.lastVerified, org.verified_at?.$date)) {
				logUpdate('lastVerified', existingOrgRecord.lastVerified, org.verified_at.$date)
				updateOrgRecord.data.lastVerified = org.verified_at.$date
			}
			updateOrgRecord.data = filterUndefined(updateOrgRecord.data)
			if (Object.keys(updateOrgRecord.data).length) {
				updateOrgRecord.data.updatedAt = updatedAt
				update.organization.add(updateOrgRecord)
				genAuditUpdate(existingOrgRecord, updateOrgRecord.data, { organizationId })
				log(`Updated ${Object.keys(updateOrgRecord.data).length} keys`, undefined, true)
			}

			// #endregion

			/**
			 * .
			 *
			 * === LOCATION ===
			 *
			 * .
			 */
			// #region Location
			if (!org.locations.length) {
				log('SKIPPING Location records, no locations', 'skip')
			} else {
				log(`Processing ${org.locations.length} Location records`, 'generate')
				let locationCount = 1
				let locationSkip = 0
				const deletedLocations = await prisma.orgLocation.findMany({
					where: {
						legacyId: { notIn: org.locations.map((x) => x._id.$oid) },
						deleted: false,
						orgId: organizationId,
					},
					select: { id: true, name: true },
				})
				if (deletedLocations.length) {
					log(`Marking ${deletedLocations.length} Location records as deleted`, 'trash')
					for (const location of deletedLocations) {
						log(`Marking Location: ${location.name} as deleted`, undefined, true)
						update.orgLocation.add({ where: { id: location.id }, data: { deleted: true } })
						genAuditUpdate({ deleted: false }, { deleted: true }, { orgLocationId: location.id })
					}
				}

				for (const location of org.locations) {
					log(
						`Processing Location: ${location.name} [${locationCount + locationSkip}/${org.locations.length}]`,
						'generate'
					)

					if (!location.country && !location.city && !location.state) {
						log(`SKIPPING Location: ${location.name} -- Missing city, governing district, & country`, 'skip')
						exceptions.location.add({ organizationId, record: location })
						locationSkip++
						continue
					}
					const existingLocationId = existing.locationId.get(location._id.$oid)
					if (existingLocationId) {
						log(`Reconcile location against ${existingLocationId}`, undefined, true)

						const existingLocation = await prisma.orgLocation.findUniqueOrThrow({
							where: { id: existingLocationId },
						})
						const updateRecord: Prisma.OrgLocationUpdateArgs = {
							where: { id: existingLocation.id },
							data: {},
						}
						const [longitude, latitude] = location.geolocation.coordinates.map(
							(x) => +parseFloat(x.$numberDecimal).toFixed(3)
						)

						if (needsUpdate(existingLocation.name, location.name)) {
							logUpdate('name', existingLocation.name, location.name)
							updateRecord.data.name = emptyStrToNull(location.name) ?? null
						}
						if (needsUpdate(existingLocation.street1, location.address)) {
							logUpdate('street1', existingLocation.street1, location.address)
							updateRecord.data.street1 = location.address ? trimSpaces(location.address) : undefined
						}
						if (needsUpdate(existingLocation.street2, location.unit)) {
							logUpdate('street2', existingLocation.street2, location.unit)
							updateRecord.data.street2 = emptyStrToNull(location.unit) ?? null
						}

						if (needsUpdate(existingLocation.city, location.city?.replace(washdcRegex, 'Washington'))) {
							logUpdate('city', existingLocation.city, location.city?.replace(washdcRegex, 'Washington'))
							updateRecord.data.city = location.city
								? trimSpaces(location.city.replace(washdcRegex, 'Washington'))
								: undefined
						}
						if (needsUpdate(existingLocation.postCode, location.zip_code)) {
							logUpdate('postCode', existingLocation.postCode, location.zip_code)
							updateRecord.data.postCode = emptyStrToNull(location.zip_code) ?? null
						}
						if (needsUpdate(existingLocation.primary, location.is_primary)) {
							logUpdate('primary', existingLocation.primary, location.is_primary)
							updateRecord.data.primary = location.is_primary
						}
						if (
							needsUpdate(
								existingLocation.govDistId,
								getGovDistId(location.state, location.city, location._id.$oid)
							)
						) {
							logUpdate(
								'govDistId',
								existingLocation.govDistId,
								getGovDistId(location.state, location.city, location._id.$oid)
							)
							updateRecord.data.govDistId = getGovDistId(location.state, location.city, location._id.$oid)
						}
						if (
							needsUpdate(
								existingLocation.countryId,
								getCountryId(location.country, location.state, location._id.$oid)
							)
						) {
							logUpdate(
								'countryId',
								existingLocation.countryId,
								getCountryId(location.country, location.state, location._id.$oid)
							)
							updateRecord.data.countryId = getCountryId(location.country, location.state, location._id.$oid)
						}
						if (
							needsUpdate(existingLocation.longitude, longitude) ||
							needsUpdate(existingLocation.latitude, latitude)
						) {
							logUpdate(
								'geo',
								`[${existingLocation.longitude}, ${existingLocation.latitude}]`,
								`[${longitude}, ${latitude}]`
							)
							const geoObj = createPoint({ longitude, latitude })
							const geoJSON = JsonInputOrNull.parse(geoObj)
							const geoWKT = geoObj === 'JsonNull' ? undefined : geojsonToWKT(geoObj)
							updateRecord.data.latitude = latitude
							updateRecord.data.longitude = longitude
							updateRecord.data.geoJSON = geoJSON
							updateRecord.data.geoWKT = geoWKT
						}
						if (needsUpdate(existingLocation.published, location.show_on_organization)) {
							if (location.show_on_organization === true) {
								log(`SKIPPING - Mark location as published`, 'skip', true)
							} else {
								logUpdate('published', existingLocation.published, location.show_on_organization)
								updateRecord.data.published = location.show_on_organization
							}
						}
						updateRecord.data = filterUndefined(updateRecord.data)
						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgLocation.add(updateRecord)
							genAuditUpdate(existingLocation, updateRecord.data, { orgLocationId: existingLocation.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(
							`Creating Location: ${location.name} [${locationCount + locationSkip}/${org.locations.length}]`,
							'generate'
						)
						const [longitude, latitude] = location.geolocation.coordinates.map(
							(x) => +parseFloat(x.$numberDecimal).toFixed(3)
						)
						const geoObj = createPoint({ longitude, latitude })
						const geoJSON = JsonInputOrNull.parse(geoObj)
						const geoWKT = geoObj === 'JsonNull' ? undefined : geojsonToWKT(geoObj)
						if (!location.city) location.city = ''

						const newLocation: Prisma.OrgLocationCreateManyInput = {
							id: generateId('orgLocation'),
							orgId: organizationId,
							legacyId: location._id.$oid,
							name: location.name,
							street1: location.address ? trimSpaces(location.address) : '',
							street2: emptyStrToNull(location.unit) ?? undefined,
							city: trimSpaces(location.city.replace(washdcRegex, 'Washington')),
							postCode: emptyStrToNull(location.zip_code) ?? undefined,
							countryId: getCountryId(location.country, location.state, location._id.$oid),
							govDistId: getGovDistId(location.state, location.city, location._id.$oid),
							primary: location.is_primary,
							published: location.show_on_organization,
							longitude,
							latitude,
							geoJSON,
							geoWKT,
							createdAt,
							updatedAt,
						}
						create.orgLocation.add(filterUndefined(newLocation) as Prisma.OrgLocationCreateManyInput)
						genAuditCreate(filterUndefined(newLocation), { orgLocationId: newLocation.id })
					}

					locationCount++
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === EMAILS ===
			 *
			 * .
			 */
			// #region Emails
			if (!org.emails.length) {
				log('SKIPPING Email records, no emails', 'skip')
			} else {
				log(`Processing ${org.emails.length} Email records`, 'generate')
				let emailCount = 1
				const emailSkip = 0

				for (const email of org.emails) {
					log(`Processing Email: ${email.email} [${emailCount + emailSkip}/${org.emails.length}]`, 'generate')
					const existingRecord = await prisma.orgEmail.findUnique({
						where: { legacyId: email._id.$oid },
						include: { description: { include: { tsKey: true } } },
					})
					if (existingRecord) {
						log(`Reconcile email against ${existingRecord.id}`, undefined, true)
						const updateRecord: Prisma.OrgEmailUpdateArgs = {
							where: { id: existingRecord.id },
							data: {},
						}
						if (needsUpdate(existingRecord.email, email.email)) {
							logUpdate('email', existingRecord.email, email.email)
							updateRecord.data.email = trimSpaces(email.email)
						}
						if (needsUpdate(existingRecord.primary, email.is_primary)) {
							logUpdate('primary', existingRecord.primary, email.is_primary)
							updateRecord.data.primary = email.is_primary
						}
						if (needsUpdate(existingRecord.published, email.show_on_organization)) {
							if (email.show_on_organization === true) {
								log(`SKIPPING - Mark email as published`, 'skip', true)
							} else {
								logUpdate('published', existingRecord.published, email.show_on_organization)
								updateRecord.data.published = email.show_on_organization
							}
						}
						if (needsUpdate(existingRecord.firstName, emptyStrToNull(email.first_name))) {
							logUpdate('firstName', existingRecord.firstName, emptyStrToNull(email.first_name))
							updateRecord.data.firstName = emptyStrToNull(email.first_name)
						}
						if (needsUpdate(existingRecord.lastName, emptyStrToNull(email.last_name))) {
							logUpdate('lastName', existingRecord.lastName, emptyStrToNull(email.last_name))
							updateRecord.data.lastName = emptyStrToNull(email.last_name)
						}
						if (needsUpdate(existingRecord.description?.tsKey.text, trimSpaces(email.title ?? ''))) {
							logUpdate('description', existingRecord.description?.tsKey.text, email.title)
							if (existingRecord.description && email.title) {
								if (existingRecord.description.tsKey.crowdinId)
									crowdin.update.add({
										id: existingRecord.description.tsKey.crowdinId,
										text: trimSpaces(email.title),
									})
								const { ns, key } = existingRecord.description
								update.translationKey.add({
									where: { ns_key: { ns, key } },
									data: { text: trimSpaces(email.title) },
								})
								genAuditUpdate(
									{ text: existingRecord.description.tsKey.text },
									{ text: trimSpaces(email.title) },
									{
										orgEmailId: existingRecord.id,
										translationKey: key,
										translationNs: ns,
										freeTextId: existingRecord.description.id,
									}
								)
							} else if (existingRecord.description && !email.title) {
								log(`Deleting Email description: ${existingRecord.description.tsKey.text}`, 'trash', true)
								if (existingRecord.description.tsKey.crowdinId)
									crowdin.update.add({ id: existingRecord.description.tsKey.crowdinId, delete: true })
								updateRecord.data.description = { delete: {} }
							} else if (!existingRecord.description && email.title) {
								log(`Creating Email description: ${email.title}`, 'generate', true)
								const freeText = generateFreeTextKey({
									orgId: organizationId,
									type: 'description',
									itemId: existingRecord.id,
									text: trimSpaces(email.title),
								})
								if (freeText) {
									const id = generateId('freeText')
									const { key, ns, text } = freeText
									crowdin.create.add({ key, text })
									create.translationKey.add({ key, ns, text })
									create.freeText.add({ id, key, ns })
									updateRecord.data.description = { connect: { id } }
									genAuditCreate(
										{ key, ns, text },
										{ translationKey: key, translationNs: ns, freeTextId: id, orgEmailId: existingRecord.id }
									)
								}
							}
						}

						updateRecord.data = filterUndefined(updateRecord.data)
						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgEmail.add(updateRecord)
							genAuditUpdate(existingRecord, updateRecord.data, { orgEmailId: existingRecord.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(`Creating Email: ${email.email} [${emailCount + emailSkip}/${org.emails.length}]`, 'generate')
						const newId = generateId('orgEmail')
						const newEmail: Prisma.OrgEmailCreateManyInput = {
							id: newId,
							email: trimSpaces(email.email),
							legacyId: email._id.$oid,
							primary: email.is_primary,
							published: email.show_on_organization,
							firstName: emptyStrToNull(email.first_name) ?? undefined,
							lastName: emptyStrToNull(email.last_name) ?? undefined,
							createdAt,
							updatedAt,
						}
						if (email.title) {
							const freeText = generateFreeTextKey({
								orgId: organizationId,
								text: trimSpaces(email.title),
								type: 'description',
								itemId: newId,
							})
							if (freeText) {
								const id = generateId('freeText')
								const { key, ns, text } = freeText
								crowdin.create.add({ key, text })
								create.translationKey.add({ key, ns, text })
								create.freeText.add({ id, key, ns })
								newEmail.descriptionId = id
								genAuditCreate(
									{ key, ns, text },
									{ translationKey: key, translationNs: ns, freeTextId: id, orgEmailId: newId }
								)
							}
						}
						create.organizationEmail.add({ organizationId, orgEmailId: newEmail.id as string })
						create.orgEmail.add(filterUndefined(newEmail) as Prisma.OrgEmailCreateManyInput)
						genAuditCreate(filterUndefined(newEmail), { orgEmailId: newEmail.id })
					}
					emailCount++
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === PHONES ===
			 *
			 * .
			 */
			// #region Phones
			if (!org.phones.length) {
				log('SKIPPING Phone records, no phones', 'skip')
			} else {
				log(`Processing ${org.phones.length} Phone records`, 'generate')
				let phoneCount = 1
				let phoneSkip = 0
				const deletedPhones = await prisma.orgPhone.findMany({
					where: {
						legacyId: { notIn: org.phones.map((x) => x._id.$oid) },
						organization: { organizationId },
						deleted: false,
					},
					select: { id: true, number: true },
				})
				if (deletedPhones.length) {
					log(`Marking ${deletedPhones.length} Phone records as deleted`, 'trash')
					for (const phone of deletedPhones) {
						log(`Marking phone ${phone.number} as deleted`, undefined, true)
						update.orgPhone.add({ where: { id: phone.id }, data: { deleted: true } })
						genAuditUpdate({ deleted: false }, { deleted: true }, { orgPhoneId: phone.id })
					}
				}

				for (const phone of org.phones) {
					if (!phone.digits) {
						phoneSkip++
						log(
							`SKIPPING ${phone._id.$oid} - Missing digits [${phoneCount + phoneSkip}/${org.phones.length}]`,
							'skip',
							true
						)
						continue
					}
					log(
						`Processing Phone: ${phone.digits} [${phoneCount + phoneSkip}/${org.phones.length}]`,
						'generate'
					)
					const existingRecord = await prisma.orgPhone.findUnique({
						where: { legacyId: phone._id.$oid },
						include: { description: { include: { tsKey: true } } },
					})
					if (existingRecord) {
						log(`Reconcile phone against ${existingRecord.id}`, undefined, true)
						const updateRecord: Prisma.OrgPhoneUpdateArgs = {
							where: { id: existingRecord.id },
							data: {},
						}
						const countryCodes = ['CA', 'MX', 'US', 'PR', 'VI', 'GU', 'AS', 'MP', 'MH', 'PW'] as const
						let phoneData: PhoneNumber | undefined
						for (const country of countryCodes) {
							const strip = /(?:,.*)|(?:option.*)/gi
							phoneData = parsePhoneNumber(
								phone.digits.replace(/\)-/, ') ').replaceAll(strip, '').replace(/×/, 'ext. '),
								country
							)
							if (phoneData?.country) {
								break
							}
						}
						if (!phoneData) {
							phoneSkip++
							log(
								`SKIPPING ${phone._id.$oid} - Cannot parse [${phoneCount + phoneSkip}/${org.phones.length}]`,
								'skip',
								true
							)
							exceptions.phone.add({ organizationId, record: phone, existing: existingRecord })
							// debugger
							continue
						}
						const phoneCountry = existing.country.get(phoneData.country ?? 'US')

						if (needsUpdate(existingRecord.number, phoneData.nationalNumber)) {
							logUpdate('number', existingRecord.number, phoneData.nationalNumber)
							updateRecord.data.number = phoneData.nationalNumber
						}
						if (needsUpdate(existingRecord.ext, phoneData.ext)) {
							logUpdate('ext', existingRecord.ext, phoneData.ext)
							updateRecord.data.ext = phoneData.ext
						}
						if (phoneCountry && needsUpdate(existingRecord.countryId, phoneCountry)) {
							logUpdate('countryId', existingRecord.countryId, phoneCountry)
							updateRecord.data.countryId = phoneCountry
						}
						if (needsUpdate(existingRecord.primary, phone.is_primary)) {
							logUpdate('primary', existingRecord.primary, phone.is_primary)
							updateRecord.data.primary = phone.is_primary
						}
						if (needsUpdate(existingRecord.published, phone.show_on_organization)) {
							if (phone.show_on_organization === true) {
								log(`SKIPPING - Mark phone as published`, 'skip', true)
							} else {
								logUpdate('published', existingRecord.published, phone.show_on_organization)
								updateRecord.data.published = phone.show_on_organization
							}
						}
						if (needsUpdate(existingRecord.description?.tsKey.text, phone.phone_type)) {
							if (!existingRecord.description) {
								const freeText = generateFreeTextKey({
									orgId: organizationId,
									text: phone.phone_type,
									type: 'description',
									itemId: existingRecord.id,
								})
								if (freeText && freeText.action === 'create') {
									log(`Adding description: ${phone.phone_type}`, 'create', true)
									const id = generateId('freeText')
									const { key, ns, text } = freeText
									create.translationKey.add({ key, ns, text })
									create.freeText.add({ id, key, ns })
									crowdin.create.add({ key, text })
									updateRecord.data.description = { connect: { id } }
									genAuditCreate(
										{ key, ns, text },
										{ translationKey: key, translationNs: ns, freeTextId: id, orgPhoneId: existingRecord.id }
									)
								}
							} else {
								log(`Updating description: ${phone.phone_type}`, 'update', true)
								const { key, ns } = existingRecord.description
								update.translationKey.add({
									where: { ns_key: { ns, key } },
									data: { text: trimSpaces(phone.phone_type) },
								})
								genAuditUpdate(
									{ text: existingRecord.description.tsKey.text },
									{ text: trimSpaces(phone.phone_type) },
									{
										orgPhoneId: existingRecord.id,
										translationKey: key,
										translationNs: ns,
										freeTextId: existingRecord.description.id,
									}
								)
								if (existingRecord.description.tsKey.crowdinId)
									crowdin.update.add({
										id: existingRecord.description.tsKey.crowdinId,
										text: trimSpaces(phone.phone_type),
									})
							}
						}
						updateRecord.data = filterUndefined(updateRecord.data)
						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgPhone.add(updateRecord)
							genAuditUpdate(existingRecord, updateRecord.data, { orgPhoneId: existingRecord.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(
							`Creating Phone: ${phone.digits} [${phoneCount + phoneSkip}/${org.phones.length}]`,
							'create',
							true
						)
						const newPhone: Prisma.OrgPhoneCreateManyInput = {
							number: '',
							countryId: '',
							createdAt,
							updatedAt,
						}

						const countryCodes = ['CA', 'MX', 'US', 'PR', 'VI', 'GU', 'AS', 'MP', 'MH', 'PW'] as const
						let phoneData: PhoneNumber | undefined
						for (const country of countryCodes) {
							phoneData = parsePhoneNumber(phone.digits, country)
							if (phoneData?.country) {
								break
							}
						}
						const phoneCountry = existing.country.get(phoneData?.country ?? 'US')
						if (!phoneData || !phoneCountry) {
							phoneSkip++
							log(
								`SKIPPING ${phone._id.$oid} - Cannot parse [${phoneCount + phoneSkip}/${org.phones.length}]`,
								'skip',
								true
							)
							exceptions.phone.add({ organizationId, record: phone, existing: null })
							continue
						}
						newPhone.id = generateId('orgPhone')
						newPhone.legacyId = phone._id.$oid
						newPhone.number = phoneData.nationalNumber
						newPhone.ext = phoneData.ext
						newPhone.countryId = phoneCountry
						if (phone.phone_type) {
							const freeText = generateFreeTextKey({
								orgId: organizationId,
								text: phone.phone_type,
								type: 'description',
								itemId: newPhone.id,
							})
							if (freeText && freeText.action === 'create') {
								log(`Adding description: ${phone.phone_type}`, 'create', true)
								const id = generateId('freeText')
								const { key, ns, text } = freeText
								create.translationKey.add({ key, ns, text })
								create.freeText.add({ id, key, ns })
								crowdin.create.add({ key, text })
								newPhone.descriptionId = id
								newPhone.legacyDesc = phone.phone_type
								genAuditCreate(
									{ key, ns, text },
									{ translationKey: key, translationNs: ns, freeTextId: id, orgPhoneId: newPhone.id }
								)
							}
						}
						create.organizationPhone.add({ organizationId, phoneId: newPhone.id })
						create.orgPhone.add(filterUndefined(newPhone) as Prisma.OrgPhoneCreateManyInput)
						genAuditCreate(filterUndefined(newPhone), { orgPhoneId: newPhone.id })
					}
					phoneCount++
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === WEBSITES ===
			 *
			 * .
			 */
			// #region Websites
			if (!org.website) {
				log('SKIPPING Website records, no entry', 'skip')
			} else {
				log(`Processing Website records`, 'generate')
				const existingRecord = await prisma.orgWebsite.findFirst({
					where: { organizationId, published: true },
				})
				if (existingRecord) {
					log(`Reconcile website against ${existingRecord.id}`, undefined, true)
					const updateRecord: Prisma.OrgWebsiteUpdateArgs = {
						where: { id: existingRecord.id },
						data: {},
					}
					if (needsUpdate(existingRecord.url, org.website)) {
						logUpdate('url', existingRecord.url, org.website)
						updateRecord.data.url = org.website
					}
					if (Object.keys(updateRecord.data).length) {
						updateRecord.data.updatedAt = updatedAt
						update.orgWebsite.add(updateRecord)
						genAuditUpdate(existingRecord, updateRecord.data, { orgWebsiteId: existingRecord.id })
						log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
					}
				} else {
					const inactiveRecord = await prisma.orgWebsite.findFirst({
						where: { organizationId },
					})
					if (inactiveRecord) {
						log(`Reconcile website against inactive record ${inactiveRecord.id}`, undefined, true)
						const updateRecord: Prisma.OrgWebsiteUpdateArgs = {
							where: { id: inactiveRecord.id },
							data: { published: true },
						}
						if (needsUpdate(inactiveRecord.url, org.website)) {
							logUpdate('url', inactiveRecord.url, org.website)
							updateRecord.data.url = org.website
						}
						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgWebsite.add(updateRecord)
							genAuditUpdate(inactiveRecord, updateRecord.data, { orgWebsiteId: inactiveRecord.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(`Creating Website: ${org.website}`, 'create', true)
						const newWebsite: Prisma.OrgWebsiteCreateManyInput = {
							id: generateId('orgWebsite'),
							organizationId,
							url: org.website,
							published: true,
							createdAt,
							updatedAt,
						}
						create.orgWebsite.add(newWebsite)
						genAuditCreate(newWebsite, { orgWebsiteId: newWebsite.id })
					}
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === SOCIAL MEDIA ===
			 *
			 * .
			 */
			// #region Social Media
			if (!org.social_media?.length) {
				log('SKIPPING Social Media records, no entry', 'skip')
			} else {
				log(`Processing ${org.social_media.length} Social Media records`, 'generate')
				let socialCount = 1
				let socialSkip = 0
				const regex =
					/(?:(?:http|https):\/\/|)(?:www\.|)(\w*)\.com\/(?:channel\/|user\/|in\/|company\/|)([a-zA-Z0-9._-]{1,})/
				for (const social of org.social_media) {
					const existingRecord = await prisma.orgSocialMedia.findUnique({
						where: { legacyId: social._id.$oid },
						include: { service: true },
					})
					if (existingRecord) {
						log(`Reconcile social media against ${existingRecord.id}`, undefined, true)
						const updateRecord: Prisma.OrgSocialMediaUpdateArgs = {
							where: { id: existingRecord.id },
							data: {},
						}
						const [, service, username] = regex.exec(social.url) ?? [undefined, undefined, '']
						const serviceId = existing.socialMediaService.get(social.name ?? service ?? raise('No service'))
						if (needsUpdate(social.url, existingRecord.url)) {
							logUpdate('url', existingRecord.url, social.url)
							updateRecord.data.url = social.url
						}
						if (serviceId && needsUpdate(serviceId, existingRecord.serviceId)) {
							logUpdate('service', existingRecord.service.name, social.name)
							updateRecord.data.service = { connect: { id: serviceId } }
						}
						if (username && needsUpdate(username, existingRecord.username)) {
							logUpdate('username', existingRecord.username, username)
							updateRecord.data.username = username
						}

						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgSocialMedia.add(updateRecord)
							genAuditUpdate(existingRecord, updateRecord.data, { orgSocialMediaId: existingRecord.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(`Creating Social Media: ${social.name}`, 'create', true)
						const [, service, username] = regex.exec(social.url) ?? [undefined, undefined, '']
						const serviceId = existing.socialMediaService.get(social.name ?? service ?? raise('No service'))
						if (!serviceId || !username) {
							socialSkip++
							log(
								`SKIPPING ${social._id.$oid} - Cannot parse [${socialCount + socialSkip}/${
									org.social_media.length
								}]`
							)
							exceptions.socialMedia.add({ organizationId, record: social, existing: null })
							continue
						}
						const newSocial: Prisma.OrgSocialMediaCreateManyInput = {
							id: generateId('orgSocialMedia'),
							legacyId: social._id.$oid,
							organizationId,
							url: social.url,
							username,
							serviceId: serviceId,
							createdAt,
							updatedAt,
						}
						create.orgSocialMedia.add(newSocial)
						genAuditCreate(newSocial, { orgSocialMediaId: newSocial.id })
					}
					socialCount++
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === PHOTOS ===
			 *
			 * .
			 */
			// #region Photos
			if (!org.photos?.length) {
				log('SKIPPING Photos records, no entries', 'skip')
			} else {
				let countPhoto = 1
				log(`Processing ${org.photos.length} Photos records`, 'generate')
				const photosToDelete = await prisma.orgPhoto.findMany({
					where: { orgId: organizationId, src: { notIn: org.photos.map(({ src }) => src) } },
				})
				if (photosToDelete.length) {
					log(`Marking ${photosToDelete.length} Photos records as deleted`, 'trash', true)
					for (const photo of photosToDelete) {
						log(`Marking ${photo.id} as deleted`, 'trash', true)
						const deleteRecord: Prisma.OrgPhotoUpdateArgs = {
							where: { id: photo.id },
							data: { deleted: true },
						}
						update.orgPhoto.add(deleteRecord)
						genAuditUpdate(photo, deleteRecord.data, { orgPhotoId: photo.id })
					}
				}
				for (const photo of org.photos) {
					log(`Processing Photo: ${photo.src} [${countPhoto}/${org.photos.length}]`, 'generate')
					const existingRecord = await prisma.orgPhoto.findFirst({
						where: { src: photo.src },
					})
					if (existingRecord) {
						log(`Reconcile photo against ${existingRecord.id}`, undefined, true)
						const updateRecord: Prisma.OrgPhotoUpdateArgs = {
							where: { id: existingRecord.id },
							data: {},
						}
						if (needsUpdate(Math.round(photo.width), existingRecord.width)) {
							logUpdate('width', existingRecord.width, Math.round(photo.width))
							updateRecord.data.width = Math.round(photo.width)
						}
						if (needsUpdate(Math.round(photo.height), existingRecord.height)) {
							logUpdate('height', existingRecord.height, Math.round(photo.height))
							updateRecord.data.height = Math.round(photo.height)
						}
						if (Object.keys(updateRecord.data).length) {
							updateRecord.data.updatedAt = updatedAt
							update.orgPhoto.add(updateRecord)
							genAuditUpdate(existingRecord, updateRecord.data, { orgPhotoId: existingRecord.id })
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(`Creating Photo: ${photo.src}`, 'create', true)
						const newPhoto: Prisma.OrgPhotoCreateManyInput = {
							id: generateId('orgPhoto'),
							orgId: organizationId,
							src: photo.src,
							width: Math.round(photo.width),
							height: Math.round(photo.height),
							createdAt,
							updatedAt,
						}
						create.orgPhoto.add(newPhoto)
						genAuditCreate(newPhoto, { orgPhotoId: newPhoto.id })
					}

					countPhoto++
				}
			}

			// #endregion

			/**
			 * .
			 *
			 * === HOURS ===
			 *
			 * .
			 */
			// #region Hours
			// if (!org.schedules?.length) {
			// 	log('SKIPPING Hours records, no entries', 'skip')
			// } else {
			// 	log(`Processing ${org.schedules.length} Hours records`, 'generate')
			// 	const hoursCount = 1
			// 	const hoursSkip = 0

			// 	for (const schedule of org.schedules) {
			// 		log(`Processing Schedule: ${schedule.name} [${hoursCount}/${org.schedules.length}]`, 'generate')
			// 		const parsed = parseSchedule(schedule)
			// 		for (const [day,data] of Object.entries(parsed)) {

			// 		}
			// 	}
			// }

			// #endregion

			/**
			 * .
			 *
			 * === ORG ATTRIBUTES ===
			 *
			 * .
			 */
			// #region Org Attributes
			if (!org.properties || !Object.keys(org.properties).length) {
				log('SKIPPING Org Attributes records, no entries', 'skip')
			} else {
				log(`Processing ${Object.keys(org.properties).length} Org Attributes records`, 'generate')
				let attributesCount = 1
				const attributesSkip = 0
				const unsupportedAttributes: Record<string, unknown>[] = []
				const { id: unsupportedId } =
					existing.attribute.get('sys.incompatible-info') ?? raise(`Cannot find 'incompatible' id`)
				const existingAttributes = await prisma.organizationAttribute.findMany({
					where: { organizationId },
					include: { supplement: { include: { text: { include: { tsKey: true } } } } },
				})
				const existingServArea = await prisma.serviceArea.findUnique({
					where: { organizationId },
					include: { countries: true, districts: true },
				})
				const orgAttrib: Record<string, AttrSupp[]> = {}
				const orgServArea: ServArea = { countries: [], districts: [] }
				for (const [tag, value] of Object.entries(org.properties)) {
					log(
						`Processing Tag: ${tag} [${attributesCount + attributesSkip}/${
							Object.keys(org.properties).length
						}]`,
						'generate'
					)
					const tagRecord = tagParser(tag, value)

					switch (tagRecord.type) {
						case 'unknown': {
							log(`Unsupported Attribute: ${Object.keys(tagRecord.supplementData).join()}`, undefined, true)
							unsupportedAttributes.push(tagRecord.supplementData)
							break
						}
						case 'attribute': {
							const attribId = tagRecord.attributeId ?? raise('missing attributeId')
							if (tagRecord.supplementData?.data)
								tagRecord.supplementData.data = superjson.stringify(tagRecord.supplementData.data)
							if (Object.hasOwn(orgAttrib, attribId) && tagRecord.supplementData) {
								orgAttrib[attribId]?.push(tagRecord.supplementData)
							} else {
								orgAttrib[attribId] = tagRecord.supplementData ? [tagRecord.supplementData] : []
							}
							break
						}
						case 'serviceArea': {
							if (tagRecord.supplementData?.countryId)
								orgServArea.countries.push(tagRecord.supplementData.countryId)
							if (tagRecord.supplementData?.govDistId)
								orgServArea.districts.push(tagRecord.supplementData.govDistId)
							break
						}
					}
					attributesCount++
				}
				if (unsupportedAttributes.length) {
					orgAttrib[unsupportedId] = [
						{
							data: superjson.stringify(unsupportedAttributes),
						},
					]
				}
				for (const [attributeId, attributeSupplement] of Object.entries(orgAttrib)) {
					const existingIdx = existingAttributes.findIndex(({ attributeId: id }) => id === attributeId)
					if (existingIdx !== -1) {
						const existing = existingAttributes.splice(existingIdx, 1)[0] ?? raise('Unable to get record')
						const existingSupplements = existing.supplement.map(
							({ boolean, countryId, govDistId, languageId, data, text, id }) =>
								filterObject<AttrSupp>(
									{
										id,
										boolean,
										countryId,
										govDistId,
										languageId,
										data: data
											? superjson.stringify(superjson.deserialize(data as unknown as SuperJSONResult))
											: undefined,
										text: text?.tsKey.text,
									},
									(k, v) => Boolean(v)
								)
						)

						const sortedExisting = sortArray(
							existingSupplements.map(({ id, ...data }) => data),
							(data) => Object.entries(data).forEach(([k, v]) => v)
						)
						const sortedUpdates = sortArray(attributeSupplement, ({ id, ...data }) =>
							Object.entries(data).forEach(([k, v]) => v)
						)

						const changes = diff(sortedExisting, sortedUpdates)
						if (changes.length) {
							const diff = getDiff(
								existingSupplements.map(({ id, ...data }) => data),
								attributeSupplement
							)
							const updated = diffApply(existingSupplements, changes)

							const pendingUpdates = generateSupplementTxn(updated, changes)
							// #region Process Supplement Changes
							const processChanges = (txn: AttrSupplementChange) => {
								if (!txn.where.id) {
									logAddition(`attribute ${existing.attributeId}`, 'attributeSupplement')
									const { data, text, ...rest } = txn.data
									const newSupplement: Prisma.AttributeSupplementCreateManyInput = {
										id: generateId('attributeSupplement'),
										...rest,
										...conditionalObj(data, {
											data: JsonInputOrNull.parse(
												superjson.serialize(typeof data === 'string' ? superjson.parse(data) : data)
											),
										}),
										createdAt,
										updatedAt,
									}
									if (text) {
										logAddition('freeText', text)
										const { key, ns } =
											generateFreeTextKey({
												orgId: organizationId,
												text,
												type: 'supplement',
												itemId: newSupplement.id,
											}) ?? {}
										if (key && ns) {
											const id = generateId('freeText')
											create.translationKey.add({ key, ns, text, createdAt, updatedAt })
											create.freeText.add({ id, key, ns, updatedAt, createdAt })
											crowdin.create.add({ key, text })
											txn.data.textId = id
										}
									}
									create.attributeSupplement.add(newSupplement)
									genAuditCreate(newSupplement, { attributeSupplementId: newSupplement.id })
								} else {
									const existingSupp =
										existing.supplement.find(({ id }) => id === txn.where.id) ?? raise('Cannot locate record')
									if (txn.data.text) {
										// update TranslationKey record
										const { key, ns, text: oldText, crowdinId } = existingSupp.text?.tsKey ?? {}
										const { text } = txn.data
										if (key && ns) {
											logUpdate('text', oldText, text)
											update.translationKey.add({ where: { ns_key: { ns, key } }, data: { text, updatedAt } })
											if (crowdinId) crowdin.update.add({ id: crowdinId, text })
											genAuditUpdate(
												{ text: oldText },
												{ text, updatedAt },
												{ translationKey: key, translationNs: ns, attributeSupplementId: txn.where.id }
											)
										} else {
											logAddition('freeText', text)
											const { key, ns } =
												generateFreeTextKey({
													orgId: organizationId,
													text,
													type: 'supplement',
													itemId: txn.where.id,
												}) ?? {}
											if (key && ns) {
												const id = generateId('freeText')
												create.translationKey.add({ key, ns, text, createdAt, updatedAt })
												create.freeText.add({ id, key, ns, updatedAt, createdAt })
												crowdin.create.add({ key, text })
												txn.data.textId = id
											}
										}
									}
									const { text: _, data, ...rest } = txn.data
									// if (existingOrgRecord.name === 'North East Medical Services') debugger

									const updatedRecord: Prisma.AttributeSupplementUpdateArgs = {
										where: { id: txn.where.id },
										data: {
											...conditionalObj(data, {
												data: JsonInputOrNull.parse(
													superjson.serialize(typeof data === 'string' ? superjson.parse(data) : data)
												),
											}),
											...rest,
											updatedAt,
										},
									}
									update.attributeSupplement.add(updatedRecord)
									const { text: _origText, ...originalRecord } = existingSupp
									const filteredOriginal = pick(
										originalRecord,
										Object.keys(updatedRecord.data) as unknown as keyof typeof originalRecord
									)
									logUpdate(
										updatedRecord.where?.id ?? 'attributeSupplement',
										omit(filteredOriginal, 'updatedAt'),
										omit(updatedRecord.data, 'updatedAt')
									)
									genAuditUpdate(filteredOriginal, updatedRecord.data, {
										attributeSupplementId: updatedRecord.where.id,
									})
								}
							}
							// #endregion

							if (Array.isArray(pendingUpdates)) {
								for (const item of pendingUpdates) {
									processChanges(item)
								}
							} else {
								processChanges(pendingUpdates)
							}
						}
						// debugger
					} else {
						logAddition('organizationAttribute', attributeId)
						create.organizationAttribute.add({ attributeId, organizationId })
						genAuditLink({ attributeId, organizationId })

						for (const supplement of attributeSupplement) {
							if (supplement.text) {
								const { key, ns, text } =
									generateFreeTextKey({
										orgId: organizationId,
										text: supplement.text,
										type: 'supplement',
										itemId: supplement.id,
									}) ?? {}
								if (key && ns && text) {
									logAddition('translationKey', { key, ns, text, updatedAt, createdAt })
									create.translationKey.add({ key, ns, text })
									logAddition('freeText', supplement.text)
									const textId = generateId('freeText')
									create.freeText.add({ id: textId, key, ns, updatedAt, createdAt })
									crowdin.create.add({ key, text })
									supplement.textId = textId
									delete supplement.text
								}
							}
							logAddition('attributeSupplement', supplement)
							create.attributeSupplement.add(supplement)
						}
					}
				}
				if (existingAttributes.length) {
					log(
						`Reviewing ${existingAttributes.length} existing attributes for possible deactivation`,
						undefined,
						true
					)
					for (const record of existingAttributes) {
						log(`Processing ${record.attributeId}`, undefined, true)
						const { attributeId } = record
						if (!attribsToNotDelete.has(attributeId)) {
							logUpdate('active', 'true', 'false')
							update.organizationAttribute.add({
								where: { organizationId_attributeId: { attributeId, organizationId } },
								data: { active: false },
							})
							genAuditUpdate({ active: true }, { active: false }, { organizationId, attributeId })
						}
					}
				}

				if (orgServArea.countries.length || orgServArea.districts.length) {
					if (existingServArea) {
						const current = {
							countries: existingServArea.countries.map(({ countryId }) => countryId),
							districts: existingServArea.districts.map(({ govDistId }) => govDistId),
						}

						const changes: { add: ServArea; del: ServArea } = {
							add: { countries: [], districts: [] },
							del: { countries: [], districts: [] },
						}
						let hasChanges = false

						for (const key of Object.keys(orgServArea)) {
							for (const id of orgServArea[key]) {
								if (!current[key].includes(id)) {
									changes.add[key].push(id)
									hasChanges = true
								}
							}
						}
						for (const key of Object.keys(current)) {
							for (const id of current[key]) {
								if (!orgServArea[key].includes(id)) {
									changes.del[key].push(id)
									hasChanges = true
								}
							}
						}
						if (hasChanges) {
							logUpdate(
								'serviceArea',
								{ govDistId: current.districts, countryId: current.countries },
								{ ...orgServArea }
							)
							update.serviceArea.add({
								where: { id: existingServArea.id },
								data: {
									...conditionalObj(changes.del.districts.length || changes.add.districts.length, {
										districts: {
											...conditionalObj(changes.del.districts.length, {
												deleteMany: { govDistId: { in: changes.del.districts } },
											}),
											...conditionalObj(changes.add.districts.length, {
												createMany: {
													data: changes.add.districts.map((govDistId) => ({ govDistId })),
													skipDuplicates: true,
												},
											}),
										},
									}),
									...conditionalObj(changes.del.countries.length || changes.add.countries.length, {
										countries: {
											...conditionalObj(changes.del.countries.length, {
												deleteMany: { countryId: { in: changes.del.countries } },
											}),
											...conditionalObj(changes.add.countries.length, {
												createMany: {
													data: changes.add.countries.map((countryId) => ({ countryId })),
													skipDuplicates: true,
												},
											}),
										},
									}),
								},
							})
						}
						genAuditUpdate(existingServArea, { ...orgServArea }, { serviceAreaId: existingServArea.id })
					} else {
						logAddition('serviceArea', { ...orgServArea })
						const id = generateId('serviceArea')
						create.serviceArea.add({ id, createdAt, updatedAt, organizationId })
						genAuditCreate({ ...orgServArea, createdAt, updatedAt, organizationId }, { serviceAreaId: id })
						orgServArea.countries.forEach((countryId) => {
							logAddition('serviceAreaCountry', countryId)
							const record = { countryId, serviceAreaId: id, linkedAt: updatedAt }
							create.serviceAreaCountry.add(record)
							genAuditLink({ countryId, serviceAreaId: id })
						})
						orgServArea.districts.forEach((govDistId) => {
							logAddition('serviceAreaDists', govDistId)
							const record = { govDistId, serviceAreaId: id, linkedAt: updatedAt }
							create.serviceAreaDist.add(record)
							genAuditLink({ govDistId, serviceAreaId: id })
						})
					}
				}
			}

			// #endregion
			if (process.env.LIMIT && parseInt(process.env.LIMIT) === orgCounter) break
			orgCounter++
		}
		writeBatches(task)
	},
} satisfies ListrJob

type AuditLogLinks = Omit<
	Prisma.AuditLogCreateManyInput,
	'id' | 'actorId' | 'from' | 'to' | 'operation' | 'timestamp'
>

interface AttrSupplementChange {
	where: { id?: string }
	data: Omit<AttrSupp, 'id'>
}

type ServArea = {
	countries: string[]
	districts: string[]
}
