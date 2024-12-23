import { generateNestedFreeText } from '~db/lib/generateFreeText'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-12-22_update-alert-link',
	title: 'Search page alert',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240627_search_page_alert = {
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

		const alertId = 'alrt_01J1D1GAT5G5S6QNMCND5PMDAX'

		const newAlert = await prisma.locationAlert.create({
			data: {
				id: alertId,
				level: 'WARN_PRIMARY',
				text: generateNestedFreeText({
					type: 'locationAlert',
					freeTextId: 'ftxt_01J1D1GVD7X1VBKZMPJ8AKYYMB',
					itemId: alertId,
					text: 'This <Link href=“https://www.erininthemorning.com/p/post-election-2024-anti-trans-risk”>anti-trans legislative risk map</Link> shows the 2-year risk for anti-trans laws in all 50 states and D.C.',
				}),
				country: { connect: { cca2: 'US' } },
			},
		})

		log(`Created alert ${newAlert.id}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
