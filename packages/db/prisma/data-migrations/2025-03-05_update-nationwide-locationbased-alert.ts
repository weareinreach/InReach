import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-03-05_update-nationwide-based-alert-text',
	title: 'change the nationwide alert text string',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'change the nationwide alert text string',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250305_update_nationwide_based_alert = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		// Variables for the update
		const key = 'locationBasedAlert.alrt_01J1D1GAT5G5S6QNMCND5PMDAX'
		const ns = 'org-data'
		const newTextValue =
			'Check out our list of <Link>recommended links</Link> for trans and immigrant communities'
		// Perform the update
		const update1 = await prisma.translationKey.update({
			where: { ns_key: { key, ns } },
			data: { text: newTextValue },
		})

		log(`Location-based alert text string updated: ${update1.key} with new text: "${update1.text}"`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
