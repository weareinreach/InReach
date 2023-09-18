import { type Prisma, prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-08-07_permissions',
	title: 'Add Permissions',
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
export const job20230807a = {
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

		const permissionsToAdd: Prisma.PermissionCreateManyInput[] = [
			{
				id: 'perm_01H796DFS4S46FZJSHTSR5H92Q',
				name: 'viewUserReviews',
				description: 'Can view reviews left by another user.',
			},
			{
				id: 'perm_01H79745ED9DXDY7W5EYYMXYA7',
				name: 'undeleteUserReview',
				description: 'Un-delete a user review',
			},
		]

		const permissionCreate = await prisma.permission.createMany({
			data: permissionsToAdd,
			skipDuplicates: true,
		})
		log(`Permissions created: ${permissionCreate.count}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
