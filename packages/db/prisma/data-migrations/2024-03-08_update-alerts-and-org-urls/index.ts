import { z } from 'zod'

import { prisma, Prisma } from '~db/client'
import { generateId } from '~db/lib/idGen'
import { generateUniqueSlug } from '~db/lib/slugGen'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-03-08_update-alerts-and-org-urls',
	title: 'update alerts &amp; org urls',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
const timeout = 1000 * 60 * 10
const UpdateTextSchema = z.array(
	z.object({
		where: z.object({ ns_key: z.object({ ns: z.string(), key: z.string() }) }),
		data: z.object({ text: z.string() }),
	})
)
const DeactivateIdsSchema = z.array(z.string())
const LinkUpdateSchema = z.object({
	renameOrg: z.array(
		z.object({
			data: z.object({
				name: z.string(),
			}),
			where: z.object({
				slug: z.string(),
			}),
		})
	),
	unpublishLink: z.array(z.string()),
	unpublishOrg: z.array(z.string()),
	updateUrls: z.array(
		z.object({
			data: z.object({
				url: z.string(),
			}),
			where: z.object({
				id: z.string(),
			}),
		})
	),
})
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240308_update_alerts_and_org_urls = {
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

		log(`Downloading alert text updates from datastore`)
		const updateTextRaw = await downloadFromDatastore(
			'migrations/2024-03-08_update-alerts-and-org-urls/updateText.json',
			log
		)
		const updateTextArgs = Prisma.validator<Prisma.TranslationKeyUpdateArgs[]>()(
			UpdateTextSchema.parse(updateTextRaw)
		)

		const updateTextResults = await prisma.$transaction(
			updateTextArgs.map((args) => prisma.translationKey.update(args))
		)

		log(`Updated ${updateTextResults.length} records`)

		log(`Downloading alert deactivations from datastore`)
		const deactivateIds = await downloadFromDatastore(
			'migrations/2024-03-08_update-alerts-and-org-urls/deactivate.json',
			log
		).then((data) => DeactivateIdsSchema.parse(data))
		const deactivateResults = await prisma.attributeSupplement.updateMany({
			where: { id: { in: deactivateIds } },
			data: { active: false },
		})

		log(`Deactivated ${deactivateResults.count} records`)

		log(`Downloading url & misc updates from datastore`)
		const linkUpdates = await downloadFromDatastore(
			'migrations/2024-03-08_update-alerts-and-org-urls/links.json',
			log
		).then((data) => LinkUpdateSchema.parse(data))
		const unpublishedLinks = await prisma.orgWebsite.updateMany({
			where: { id: { in: linkUpdates.unpublishLink } },
			data: { published: false },
		})
		log(`Unpublished ${unpublishedLinks.count} website records`)

		const unpublishedOrgs = await prisma.organization.updateMany({
			where: { slug: { in: linkUpdates.unpublishOrg } },
			data: { published: false },
		})
		log(`Unpublished ${unpublishedOrgs.count} org records`)

		const updateOrgNames = await prisma.$transaction(
			async (tx) => {
				const updates: string[] = []
				for (const item of linkUpdates.renameOrg) {
					const { id: orgId } = await prisma.organization.findUniqueOrThrow({
						where: { slug: item.where.slug },
					})
					const newSlug = await generateUniqueSlug({ name: item.data.name, id: orgId })
					const updateName = await tx.organization.update({
						where: item.where,
						data: {
							...item.data,
							slug: newSlug,
							oldSlugs: {
								upsert: {
									where: { from: item.where.slug },
									create: {
										from: item.where.slug,
										to: newSlug,
										id: generateId('slugRedirect'),
									},
									update: {},
								},
							},
						},
						select: {
							id: true,
						},
					})
					updates.push(updateName.id)
				}
				return updates
			},
			{ timeout }
		)
		log(`Updated ${updateOrgNames.length} org records`)

		const updateUrls = await prisma.$transaction(
			linkUpdates.updateUrls.map((args) => prisma.orgWebsite.update(args))
		)

		log(`Updated ${updateUrls.length} URL records`)

		log(`Downloading locations to hide from datastore`)
		const hideLocationSlugs = await downloadFromDatastore(
			'migrations/2024-03-08_update-alerts-and-org-urls/hideLocations.json',
			log
		).then((data) => DeactivateIdsSchema.parse(data))
		const hideLocations = await prisma.orgLocation.updateMany({
			where: {
				organization: {
					slug: { in: hideLocationSlugs },
				},
			},
			data: {
				notVisitable: true,
			},
		})

		log(`Updated ${hideLocations.count} location records`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
