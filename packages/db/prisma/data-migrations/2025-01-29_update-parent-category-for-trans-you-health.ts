import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-29_update-parent-category-for-trans-you-health',
	title: 'update parent category for trans you health',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250129_update_parent_category_for_trans_you_health = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, downloadFromDatastore, generateId, formatMessage, jobPostRunner, prisma } = ctx
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

		const update = await prisma.$transaction([
			prisma.serviceTag.update({
				where: { id: 'svtg_01HAD647BVMT10DWEXFG1EFM9J' },
				data: { name: 'Trans - youth care' },
			}),
		])

		// Extract the serviceTagId from the update result
		const serviceTagId = update[0].id
		console.log('Updated ServiceTag ID:', serviceTagId)

		// Find the category IDs for "Medical" and "Mental Health"
		const categories = await prisma.serviceCategory.findMany({
			where: {
				category: {
					in: ['Medical', 'Mental Health'],
				},
			},
			select: { id: true, category: true },
		})

		// Extract the IDs for "Medical" and "Mental Health"
		const medicalCategory = categories.find((c) => c.category === 'Medical')
		const mentalHealthCategory = categories.find((c) => c.category === 'Mental Health')

		if (!medicalCategory || !mentalHealthCategory) {
			throw new Error("Could not find category IDs for 'Medical' or 'Mental Health'")
		}

		console.log('Medical Category ID:', medicalCategory.id)
		console.log('Mental Health Category ID:', mentalHealthCategory.id)

		// Update ServiceTagToCategory where categoryId = Medical and serviceTagId = updated serviceTagId
		const updateResult = await prisma.$transaction([
			prisma.serviceTagToCategory.updateMany({
				where: {
					categoryId: medicalCategory.id,
					serviceTagId: serviceTagId,
				},
				data: {
					categoryId: mentalHealthCategory.id, // Change to Mental Health's ID
				},
			}),
		])

		console.log('Updated ServiceTagToCategory rows:', updateResult)
		console.log('Category ID changed from', medicalCategory.id, 'to', mentalHealthCategory.id)
		console.log('For ServiceTag ID:', serviceTagId)

		console.log('Update complete!')

		log(`serviceTag records updated: ${update.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
