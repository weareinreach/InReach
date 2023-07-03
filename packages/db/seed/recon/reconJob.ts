import { geojsonToWKT } from '@terraformer/wkt'
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
import { create, update, writeBatches } from '~db/seed/recon/lib/output'
import { type ListrJob } from '~db/seed/recon/lib/types'
import { emptyStrToNull, trimSpaces } from '~db/seed/recon/lib/utils'
import { JsonInputOrNull } from '~db/zod_util/prismaJson'

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
				needsUpdate(existingOrgRecord.description.tsKey.text, trimSpaces(org.description))
			) {
				logUpdate('description', existingOrgRecord.description.tsKey.text, trimSpaces(org.description))
				update.translationKey.add({
					where: { ns_key: { ns: namespace.orgData, key: existingOrgRecord.description.key } },
					data: { text: trimSpaces(org.description) },
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

						if (needsUpdate(existingLocation.name, trimSpaces(location.name))) {
							logUpdate('name', existingLocation.name, trimSpaces(location.name))
							updateRecord.data.name = emptyStrToNull(location.name) ?? null
						}
						if (needsUpdate(existingLocation.street1, location.address)) {
							logUpdate('street1', existingLocation.street1, location.address)
							updateRecord.data.street1 = trimSpaces(location.address)
						}
						if (needsUpdate(existingLocation.street2, location.unit)) {
							logUpdate('street2', existingLocation.street2, location.unit)
							updateRecord.data.street2 = emptyStrToNull(location.unit) ?? null
						}
						const washdcRegex = /washington.*dc/i

						if (needsUpdate(existingLocation.city, location.city?.replace(washdcRegex, 'Washington'))) {
							logUpdate('city', existingLocation.city, location.city?.replace(washdcRegex, 'Washington'))
							updateRecord.data.city = trimSpaces(location.city?.replace(washdcRegex, 'Washington'))
						}
						if (needsUpdate(existingLocation.postCode, location.zip_code)) {
							logUpdate('postCode', existingLocation.postCode, location.zip_code)
							updateRecord.data.postCode = emptyStrToNull(location.zip_code) ?? null
						}
						if (needsUpdate(existingLocation.primary, location.is_primary)) {
							logUpdate('primary', existingLocation.primary, location.is_primary)
							updateRecord.data.primary = location.is_primary
						}
						if (needsUpdate(existingLocation.govDistId, getGovDistId(location.state, location.city))) {
							logUpdate('govDistId', existingLocation.govDistId, getGovDistId(location.state, location.city))
							updateRecord.data.govDistId = getGovDistId(location.state, location.city)
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
						if (Object.keys(updateRecord.data).length) {
							update.orgLocation.add(updateRecord)
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}
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

						if (Object.keys(updateRecord.data).length) {
							update.orgEmail.add(updateRecord)
							log(`Updated ${Object.keys(updateRecord.data).length} keys`, undefined, true)
						}

						emailCount++
					}
				}
			}

			// #endregion

			orgCounter++
		}
		writeBatches(task)
	},
} satisfies ListrJob
