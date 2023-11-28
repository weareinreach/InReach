import { prisma, type Prisma } from '~db/client'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-22_update-alert-messages',
	title: 'update alert messages',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

type Data = {
	alertUpdates: Prisma.TranslationKeyUpdateArgs[]
	alertDeactivate: Prisma.OrganizationAttributeUpdateManyArgs
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231122_update_alert_messages = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
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
		log(`Downloading data from datastore`)
		const data = (await downloadFromDatastore(`migrations/${jobDef.jobId}/data.json`, log)) as Data

		const deactivatedAlerts = await prisma.organizationAttribute.updateMany(data.alertDeactivate)
		log(`Deactivated alerts: ${deactivatedAlerts.count}`)

		const updatedAlertText = await prisma.$transaction(
			data.alertUpdates.map((args) => prisma.translationKey.update(args))
		)
		log(`Alerts submitted: ${data.alertUpdates.length}, updated: ${updatedAlertText.length}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
