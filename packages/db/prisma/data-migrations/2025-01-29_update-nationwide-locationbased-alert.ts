import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-29_update-nationwide-locationbased-alert',
	title: 'change the location-based alert text string',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'change the location-based alert text string',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250129_update_nationwide_locationbased_alert = {
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
			'Some organizations are adjusting services due to recent funding cuts and policy changes. Contact providers directly for updates.'

		// Perform the update
		const update1 = await prisma.translationKey.update({
			where: { ns_key: { key, ns } },
			data: { text: newTextValue },
		})

		const update2 = await prisma.locationAlert.update({
			where: { id: 'alrt_01J1D1GAT5G5S6QNMCND5PMDAX' },
			data: { level: 'WARN_SECONDARY' }, // update this to the correct id
		})

		const update3 = await prisma.locationAlert.update({
			where: { id: 'alrt_01J5XNBQ5GREHSHK5D2QTCXRWE' },
			data: { active: true }, // update this to the correct id
		})

		log(`Location-based alert text string updated: ${update1.key} with new text: "${update1.text}"`)
		log(`Location-based alert level type for anti-trans map: ${update2.key} change to: "${update2.text}"`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
