import { geojsonToWKT } from '@terraformer/wkt'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { createPoint } from '~db/lib/createPoint'
import { existingOrgsSchema } from '~db/seed/recon/input/types'
import { needsUpdate } from '~db/seed/recon/lib/compare'
import { dataCorrections, existing, getCountryId, getGovDistId } from '~db/seed/recon/lib/existing'
import { attachLogger, formatMessage } from '~db/seed/recon/lib/logger'
import { create, update, writeBatches } from '~db/seed/recon/lib/output'
import { type ListrJob } from '~db/seed/recon/lib/types'
import { JsonInputOrNull } from '~db/zod_util/prismaJson'

export const orgRecon = {
	title: 'Reconcile Organizations',
	// skip: true,
	task: async (_ctx, task) => {
		attachLogger(task)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		const logUpdate = (field: string, from: unknown, to: unknown) =>
			log(`Updating ${field} from "${from}" to "${to}"`, undefined, true)
		writeBatches(task, true)
		let orgCounter = 1

		// read input file
		const orgs = existingOrgsSchema
			.array()
			.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, './input/existingOrgs.json'), 'utf-8')))
		log(`Organizations to process: ${orgs.length}`, 'info')

		// start loop
		for (const org of orgs) {
			task.title = `Reconcile Organizations [${orgCounter}/${orgs.length}]`
			log(`Reconciling Organization: ${org.name}`)

			const organizationId = existing.orgId.get(org._id.$oid)
			if (!organizationId) {
				log(`Organization not found: ${org._id.$oid}`, 'error')
				throw new Error('Organization not found', { cause: org._id.$oid })
			}
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

						if (needsUpdate(existingLocation.name, location.name)) {
							logUpdate('name', existingLocation.name, location.name)
							updateRecord.data.name = location.name?.trim() ?? null
						}
						if (needsUpdate(existingLocation.street1, location.address)) {
							logUpdate('street1', existingLocation.street1, location.address)
							updateRecord.data.street1 = location.address?.trim()
						}
						if (needsUpdate(existingLocation.street2, location.unit)) {
							logUpdate('street2', existingLocation.street2, location.unit)
							updateRecord.data.street2 = location.unit?.trim() ?? null
						}
						if (needsUpdate(existingLocation.city, location.city)) {
							logUpdate('city', existingLocation.city, location.city)
							updateRecord.data.city = location.city?.trim()
						}
						if (needsUpdate(existingLocation.postCode, location.zip_code)) {
							logUpdate('postCode', existingLocation.postCode, location.zip_code)
							updateRecord.data.postCode = location.zip_code?.trim() ?? null
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

			orgCounter++
		}
		writeBatches(task)
	},
} satisfies ListrJob
