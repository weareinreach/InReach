import { prisma } from '~db/client'
import { isIdFor } from '~db/index'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-21_attach-orphan-text',
	title: 'attach orphan text',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240221_attach_orphan_text = {
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

		const data = await prisma.freeText.findMany({
			where: {
				AND: [
					{ AttributeSupplement: null },
					{ Organization: null },
					{ OrgEmail: null },
					{ OrgPhone: null },
					{ OrgService: null },
					{ OrgLocation: null },
					{ OrgServiceName: null },
					{ OrgWebsite: null },
				],
			},
		})
		await prisma.$transaction(
			async (tx) => {
				for (const item of data) {
					const recordToAttachTo = item.key.split('.')[1]
					if (typeof recordToAttachTo !== 'string') {
						throw new Error('Unable to get record to attach to')
					}
					if (isIdFor('orgPhone', recordToAttachTo)) {
						const result = await tx.orgPhone.update({
							where: { id: recordToAttachTo },
							data: { descriptionId: item.id },
						})
						log(`Attached orphan text ${item.key} to ${result.id}`)
					} else if (isIdFor('orgEmail', recordToAttachTo)) {
						const result = await tx.orgEmail.update({
							where: { id: recordToAttachTo },
							data: { descriptionId: item.id },
						})
						log(`Attached orphan text ${item.key} to ${result.id}`)
					}
				}
			},
			{ timeout: 180_000 }
		)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
