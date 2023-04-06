import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-06-attributes',
	title: 'Misc attribute updates',
	createdBy: 'Joe Karow',
}

const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const updateDesc = await prisma.attribute.update({
		where: {
			tag: 'other-describe',
		},
		data: {
			intDesc: 'Used for "Target Population" in Service modal',
		},
	})
	task.output = `${isSuccess(updateDesc)} Update description for "eligibility.other-describe"`

	const costIcons = await prisma.attribute.updateMany({
		where: { tag: { in: ['cost-free', 'cost-fees'] } },
		data: {
			icon: 'carbon:piggy-bank',
		},
	})
	task.output = `${isSuccess(costIcons.count)} Update icons for "cost" attributes (${costIcons.count})`
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
export const job20230406 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
