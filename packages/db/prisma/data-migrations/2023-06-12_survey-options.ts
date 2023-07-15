import { prisma } from '~db/index'
import { isSuccess } from '~db/prisma/common'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-12_survey-options',
	title: 'Add additional survey options',
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
export const job20230612 = {
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
		const immigrationNone = await prisma.userImmigration.create({
			data: {
				id: 'uimm_01H2RRM42VTDFX1TE9T0JEP0RC',
				status: 'None',
				key: {
					create: {
						key: 'immigration-none',
						text: 'I do not identify as any of these',
						namespace: { connect: { name: 'user' } },
					},
				},
			},
		})
		task.output = `${isSuccess(immigrationNone)} Create 'None of the above' for User Immigration`
		const immigrationPNTS = await prisma.userImmigration.create({
			data: {
				id: 'uimm_01H2RS1637PN3MECKRZXJRPGM2',
				status: 'Prefer not to say',
				key: {
					create: {
						key: 'immigration-prefer-not-to-say',
						text: 'Prefer not to say',
						namespace: { connect: { name: 'user' } },
					},
				},
			},
		})
		task.output = `${isSuccess(immigrationPNTS)} Create 'Prefer not to say' for User Immigration`

		const immigrationOther = await prisma.userImmigration.update({
			where: { id: 'uimm_01GW2HHHS4G6TA7FVKXBC3NT8M' },
			data: { status: 'Other immigrant', key: { update: { text: 'Other immigrant' } } },
		})

		task.output = `${isSuccess(immigrationOther)} Update 'Other immigrant' for User Immigration`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
