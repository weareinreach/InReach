import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-15_update-food-tags-to-active',
	title: 'update food tags to active',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250115_update_food_tags_to_active = {
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
				where: { id: 'svtg_01J1GDWBVVQ9BBBWMDW3J8J4MT' },
				data: {
					active: true,
				},
			}),
			prisma.serviceTag.update({
				where: { id: 'svtg_01J1GDWBWJKRP2H2NC84CXAERQ' },
				data: {
					active: true,
				},
			}),
			prisma.serviceTag.update({
				where: { id: 'svtg_01J1GDWBWZJAKK8GBQ9GECY6W6' },
				data: {
					active: true,
				},
			}),
			prisma.serviceTag.update({
				where: { id: 'svtg_01J1GDWBXBWPMPZCNAYNCGEHYP' },
				data: {
					active: true,
				},
			}),
			prisma.serviceTag.update({
				where: { id: 'svtg_01J1GDWBXYEJX7RJP7XRXJYPAH' },
				data: {
					active: true,
				},
			}),
		])
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
