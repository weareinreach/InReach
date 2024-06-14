import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-06-14_update-baltimore-to-reflect-city-and-county-options',
	title: 'update baltimore to reflect city &amp; county options',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240614_update_baltimore_to_reflect_city_and_county_options = {
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
			prisma.govDist.update({
				where: { slug: 'us-maryland-baltimore-county' },
				data: {
					name: 'Baltimore County',
					key: { update: { text: 'Baltimore County' } },
				},
			}),
			prisma.govDist.update({
				where: { slug: 'us-maryland-baltimore-city' },
				data: {
					name: 'Baltimore City',
					key: { update: { text: 'Baltimore City' } },
				},
			}),
		])
		log(`govDist records updated: ${update.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
