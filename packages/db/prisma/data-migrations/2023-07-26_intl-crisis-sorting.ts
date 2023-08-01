import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-26_intl-crisis-sorting',
	title: 'Add sort order for International Crisis Resources',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230726a = {
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

		const orgIds = [
			'orgn_01H64P2CHAE2CFWD7EF5HWAEAZ',
			'orgn_01H64R1VP03AYSEA6GBNA9PDBZ',
			'orgn_01H64R9AJBT38SDZXP2MYRR5TW',
			'orgn_01H64RC712WNQ97VZMG5DKWX60',
			'orgn_01H64RHG49SQC6QWBA1CGJ2QTZ',
		]
		const result = await prisma.$transaction(
			orgIds.map((id, i) =>
				prisma.organization.update({ where: { id }, data: { crisisResourceSort: i + 1 } })
			)
		)
		log(`Updated records: ${result.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
