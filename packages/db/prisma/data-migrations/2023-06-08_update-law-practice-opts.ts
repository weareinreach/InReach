import { prisma } from '~db/index'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-08_update-law-practice-opts',
	title: 'Update law practice options',
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
export const job20230608b = {
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

		const updates = await prisma.$transaction([
			prisma.attribute.update({
				where: { tag: 'law-other' },
				data: { name: 'Other', key: { update: { text: 'Other' } } },
			}),
			prisma.attribute.update({
				where: { tag: 'law-school-clinic' },
				data: { name: 'Law school clinic', key: { update: { text: 'Law school clinic' } } },
			}),
			prisma.attribute.update({
				where: { tag: 'legal-nonprofit' },
				data: {
					name: 'Legal nonprofit organization',
					key: { update: { text: 'Legal nonprofit organization' } },
				},
			}),
		])

		task.output = `Tags updated: ${updates.length}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
