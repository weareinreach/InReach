import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-03-01_update-locationbased-alert-string-add-emoji',
	title: 'add "Bell" emoji to alert link',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'add "Bell" emoji to alert link',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250301_update_locationbased_alert_string_add_emoji = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		// Variables for the update
		const key = 'locationBasedAlert.alrt_01J5XNBQ5GREHSHK5D2QTCXRWE'
		const ns = 'org-data'
		const newTextValue =
			'🔔 Some organizations are adjusting services due to recent funding cuts and policy changes. Contact providers directly for updates.'

		// Perform the update
		const update = await prisma.translationKey.update({
			where: { ns_key: { key, ns } },
			data: { text: newTextValue },
		})

		log(`Location-based alert text string updated: ${update.key} with new text: "${update.text}"`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
