import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-07_update-tag',
	title: 'Update Sponsors tag',
	createdBy: 'Joe Karow',
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
export const job20230706 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const update = await prisma.serviceTag.update({
			where: { id: 'svtg_01GW2HHFBN7GFWZJSATZDCK7EM' },
			data: { name: 'Immigration Sponsorship', key: { update: { text: 'Immigration Sponsorship' } } },
		})

		task.output = `Tag updated: ${update.id} - ${update.name}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
