import { type z } from 'zod'

import { prisma } from '~db/client'
import { generateNestedFreeText, generateNestedFreeTextUpsert } from '~db/lib/generateFreeText'
import { generateId } from '~db/lib/idGen'
import { generateUniqueSlug } from '~db/lib/slugGen'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { accessInstructions } from '~db/zod_util/attributeSupplement'

import {
	AccessLinksSchema,
	NewAlertsSchema,
	OrgUpdatesSchema,
	ServiceNameSchema,
	UnpublishSchema,
} from './!schemas'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-03-15_update-dead-links',
	title: 'update dead links',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240315_update_dead_links = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		log(`Downloading items to unpublish from datastore`)
		const unpublishData = UnpublishSchema.parse(
			await downloadFromDatastore('migrations/2024-03-15_update-dead-links/unpublish.json', log)
		)
		log(`Downloading service name updates from datastore`)
		const serviceNameData = ServiceNameSchema.parse(
			await downloadFromDatastore('migrations/2024-03-15_update-dead-links/serviceName.json', log)
		)
		log(`Downloading org updates from datastore`)
		const orgUpdateData = OrgUpdatesSchema.parse(
			await downloadFromDatastore('migrations/2024-03-15_update-dead-links/orgUpdates.json', log)
		)
		log(`Downloading access link updates from datastore`)
		const accessLinkData = AccessLinksSchema.parse(
			await downloadFromDatastore('migrations/2024-03-15_update-dead-links/accessLinks.json', log)
		)
		log(`Downloading new alerts from datastore`)
		const newAlertsData = NewAlertsSchema.parse(
			await downloadFromDatastore('migrations/2024-03-15_update-dead-links/newAlerts.json', log)
		)

		await prisma.$transaction(
			async (tx) => {
				const unpublishLocations = await tx.orgLocation.updateMany({
					where: { id: { in: unpublishData.locations } },
					data: { published: false },
				})
				log(`Unpublished ${unpublishLocations.count} locations`)
				const unpublishServices = await tx.orgService.updateMany({
					where: { id: { in: unpublishData.services } },
					data: { published: false },
				})
				log(`Unpublished ${unpublishServices.count} services`)
				const unpublishOrgs = await tx.organization.updateMany({
					where: { slug: { in: unpublishData.orgs } },
					data: { published: false },
				})
				log(`Unpublished ${unpublishOrgs.count} orgs`)
				const deactivateAttributes = await tx.attributeSupplement.updateMany({
					where: { id: { in: unpublishData.attributeSupplements } },
					data: { active: false },
				})
				log(`Deactivated ${deactivateAttributes.count} attribute supplements`)

				for (const { serviceId, serviceName } of serviceNameData) {
					const updatedServiceName = await tx.orgService.update({
						where: { id: serviceId },
						data: { serviceName: { update: { tsKey: { update: { text: serviceName } } } } },
					})
					log(`Updated ${updatedServiceName.id} service name to ${serviceName}`)
				}

				for (const item of orgUpdateData) {
					let newSlug: string | undefined = undefined
					let slugRedirectId: string | undefined = undefined
					const { id } = await tx.organization.findFirstOrThrow({
						where: { OR: [{ slug: item.slug }, { oldSlugs: { some: { from: item.slug } } }] },
						select: { id: true },
					})
					if (item.orgName) {
						newSlug = await generateUniqueSlug({ id, name: item.orgName })
						slugRedirectId = generateId('slugRedirect')
					}
					const updatedOrg = await tx.organization.update({
						where: { id },
						data: {
							...(newSlug && item.orgName && slugRedirectId
								? {
										name: item.orgName,
										slug: newSlug,
										oldSlugs: { create: { from: item.slug, to: newSlug, id: slugRedirectId } },
									}
								: {}),
							...(item.orgDesc
								? {
										description: generateNestedFreeTextUpsert({
											orgId: id,
											text: item.orgDesc,
											type: 'orgDesc',
										}),
									}
								: {}),
							...(item.orgUrl
								? { websites: { create: { url: item.orgUrl, id: generateId('orgWebsite') } } }
								: {}),
						},
					})
					log(`Updated organization: ${updatedOrg.name}`)
				}
				for (const item of accessLinkData.addNew) {
					const data: z.input<typeof accessInstructions.link> = accessInstructions.link.parse({
						access_type: 'link',
						access_value: item.url,
					})

					const newLink = await tx.attributeSupplement.create({
						data: {
							id: item.id,
							attributeId: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
							data,
							serviceId: item.serviceId,
						},
					})
					log(`Added new link: ${newLink.id}`)
				}
				for (const item of accessLinkData.updates) {
					const data: z.input<typeof accessInstructions.link> = accessInstructions.link.parse({
						access_type: 'link',
						access_value: item.newUrl,
					})
					const updatedLink = await tx.attributeSupplement.update({
						where: { id: item.supplementId },
						data: { data },
					})
					log(`Updated link: ${updatedLink.id}`)
				}

				for (const item of newAlertsData) {
					let orgId: string
					try {
						const { id } = await tx.organization.findFirstOrThrow({
							where: { OR: [{ slug: item.slug }, { oldSlugs: { some: { from: item.slug } } }] },
							select: { id: true },
						})
						orgId = id
					} catch {
						const redirected = await tx.slugRedirect.findFirstOrThrow({
							where: { from: item.slug },
							select: { orgId: true },
						})
						orgId = redirected.orgId
					}
					const text = generateNestedFreeText({
						orgId,
						type: 'attSupp',
						text: item.alertText,
						itemId: item.supplementId,
						freeTextId: item.freeTextId,
					})
					const newAlert = await tx.attributeSupplement.create({
						data: {
							id: item.supplementId,
							attribute: { connect: { id: 'attr_01GYSVX1NAMR6RDV6M69H4KN3T' } },
							organization: { connect: { id: orgId } },
							text,
						},
					})
					log(`Added new alert: ${newAlert.id}`)
				}
			},
			{ timeout: 1000 * 60 * 15 }
		)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
