import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-29_update-translation-key-for-trans-health-youth',
	title: 'update translation key for trans health youth',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250129_update_translation_key_for_trans_health_youth = {
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

		// Find the translation key using `ns_key`
		const translationKey = await prisma.translationKey.findUnique({
			where: {
				ns_key: {
					ns: 'services', // Namespace set as 'services'
					key: 'medical.trans-health-youth-care', // The key to update
				},
			},
		})

		if (!translationKey) {
			throw new Error('Translation key not found.')
		}

		console.log('Found Translation Key:', translationKey)

		// Update the translation key's text field
		const updatedTranslationKey = await prisma.translationKey.update({
			where: {
				ns_key: {
					ns: 'services',
					key: 'medical.trans-health-youth-care',
				},
			},
			data: {
				text: 'Trans - youth care', // The updated text value
			},
		})

		console.log('Updated Translation Key:', updatedTranslationKey)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
