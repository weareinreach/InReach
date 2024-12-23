import { generateNestedFreeText } from '~db/lib/generateFreeText'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-12-22_update-alert-link',
	title: 'Update alert link',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'This migration script updates the alert text with a new link.',
}

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20241222_update_alert_link = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, jobPostRunner, prisma, formatMessage } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		// Log that the script has started
		log('Starting to update the alert link.')

		// Define the alertId you wish to update
		const alertId = 'alrt_01J1D1GAT5G5S6QNMCND5PMDAX'

		// Fetch the existing alert record
		const existingAlert = await prisma.locationAlert.findUnique({
			where: { id: alertId },
		})

		if (!existingAlert) {
			log(`Alert with ID ${alertId} not found.`)
			return
		}

		// Update the 'text' field with a new link
		const updatedAlert = await prisma.locationAlert.update({
			where: { id: alertId },
			data: {
				text: generateNestedFreeText({
					type: 'locationAlert',
					freeTextId: existingAlert.text.freeTextId, // Retain the same freeTextId to avoid changing other content
					itemId: alertId,
					text: 'This <Link href="https://www.newlink.com">new anti-trans legislative risk map</Link> shows updated risk information.',
				}),
			},
		})

		log(`Updated alert ${updatedAlert.id} with new link`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
