import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-23_add-missing-website',
	title: 'add missing website',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240223_add_missing_website = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
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
		const brsWebsite = await prisma.orgWebsite.createMany({
			data: [
				{
					id: 'oweb_01HQBST3HJP9A2ETHEXA30CMMP',
					url: 'https://www.blackremoteshe.com',
					organizationId: 'orgn_01HQBG00A6K7XC9XFABDAA698T',
					published: true,
				},
			],
			skipDuplicates: true,
		})
		log(`Added ${brsWebsite.count} website(s)`)
		const ldBadge = await prisma.attributeSupplement.createMany({
			data: [
				{
					id: 'atts_01HQBSW9GN0Z01Q6RADYTBK5SW',
					attributeId: 'attr_01GW2HHFVN3JX2J7REFFT5NAMS',
					active: true,
					organizationId: 'orgn_01GVH3V4D6Q35GK0T6F3GADX2E',
				},
			],
		})
		log(`Added ${ldBadge.count} badge(s)`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
