import { geojsonToWKT } from '@terraformer/wkt'
import filterObject from 'just-filter-object'
import parsePhoneNumber, { type PhoneNumber } from 'libphonenumber-js/max'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { createPoint } from '~db/lib/createPoint'
import { generateId } from '~db/lib/idGen'
import { slugUpdate } from '~db/lib/slugGen'
import { organizationsSchema } from '~db/seed/recon/input/types'
import { needsUpdate } from '~db/seed/recon/lib/compare'
import { dataCorrections, existing, getCountryId, getGovDistId } from '~db/seed/recon/lib/existing'
import { attachLogger, formatMessage } from '~db/seed/recon/lib/logger'
import { create, crowdin, exceptions, update, writeBatches } from '~db/seed/recon/lib/output'
import { generateFreeTextKey } from '~db/seed/recon/lib/translations'
import { type ListrJob } from '~db/seed/recon/lib/types'
import { emptyStrToNull, trimSpaces } from '~db/seed/recon/lib/utils'
import { JsonInputOrNull } from '~db/zod_util/prismaJson'

const washdcRegex = /washington.*dc/i
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject<T> = T extends Map<any, any> | Set<any> | null ? never : T extends object ? T : never
const filterUndefined = <T extends Record<string, unknown>>(obj: PlainObject<T>) =>
	filterObject<T>(obj, (_k, v) => v !== undefined)
export const orgRecon = {
	title: 'Reconcile Organizations',
	// skip: true,
	options: { bottomBar: false },
	task: async (_ctx, task) => {
		attachLogger(task)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		const logUpdate = (field: string, from: unknown, to: unknown) =>
			log(`Updating ${field} from "${from}" to "${to}"`, 'update', true)
		writeBatches(task, true)
		let orgCounter = 1

		// read input file
		const orgs = organizationsSchema
			.array()
			.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, './input/existingOrgs.json'), 'utf-8')))
		log(`Organizations to process: ${orgs.length}`, 'info')

		// start loop
		for (const org of orgs) {
			task.title = `Reconcile Organizations [${orgCounter}/${orgs.length}]`
			log(`Reconciling Organization: ${org.name}`, 'generate')

			const organizationId = existing.orgId.get(org._id.$oid)
			if (!organizationId) {
				log(`Organization not found: ${org._id.$oid}`, 'error')
				throw new Error('Organization not found', { cause: org._id.$oid })
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
					create.slugRedirect.add({ from: existingOrgRecord.slug, to: newSlug, orgId: existingOrgRecord.id })
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
				update.organization.add(updateOrgRecord)
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
							update.orgLocation.add(updateRecord)
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
						}
						create.orgLocation.add(filterUndefined(newLocation) as Prisma.OrgLocationCreateManyInput)
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
								}
							}
						}

						updateRecord.data = filterUndefined(updateRecord.data)
						if (Object.keys(updateRecord.data).length) {
							update.orgEmail.add(updateRecord)
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
							}
						}
						create.organizationEmail.add({ organizationId, orgEmailId: newEmail.id as string })
						create.orgEmail.add(filterUndefined(newEmail) as Prisma.OrgEmailCreateManyInput)
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
								}
							} else {
								log(`Updating description: ${phone.phone_type}`, 'update', true)
								const { key, ns } = existingRecord.description
								update.translationKey.add({
									where: { ns_key: { ns, key } },
									data: { text: trimSpaces(phone.phone_type) },
								})
								if (existingRecord.description.tsKey.crowdinId)
									crowdin.update.add({
										id: existingRecord.description.tsKey.crowdinId,
										text: trimSpaces(phone.phone_type),
									})
							}
						}
						updateRecord.data = filterUndefined(updateRecord.data)
						if (Object.keys(updateRecord.data).length) {
							update.orgPhone.add(updateRecord)
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
					} else {
						log(
							`Creating Phone: ${phone.digits} [${phoneCount + phoneSkip}/${org.phones.length}]`,
							'create',
							true
						)
						const newPhone: Prisma.OrgPhoneCreateManyInput = { number: '', countryId: '' }

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
							}
						}
						create.organizationPhone.add({ organizationId, phoneId: newPhone.id })
						create.orgPhone.add(filterUndefined(newPhone) as Prisma.OrgPhoneCreateManyInput)
					}
				}

				phoneCount++
			}

			// #endregion

			orgCounter++
		}
		writeBatches(task)
	},
} satisfies ListrJob
