import { prisma, Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-21-badge-render',
	title: 'Set badge render field',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const updates: Prisma.AttributeCategoryUpdateManyArgs[] = [
		{ where: { tag: { in: ['additional-information', 'cost'] } }, data: { renderVariant: 'ATTRIBUTE' } },
		{ where: { tag: 'organization-leadership' }, data: { renderVariant: 'LEADER' } },
		{ where: { tag: 'service-focus' }, data: { renderVariant: 'COMMUNITY' } },
		{ where: { tag: { in: ['eligibility-requirements', 'languages'] } }, data: { renderVariant: 'LIST' } },
	]

	const results = await prisma.$transaction(
		updates.map((params) => prisma.attributeCategory.updateMany(params))
	)

	const resultCount = results.reduce((prev, { count }) => prev + count, 0)

	task.output = `AttributeCategory records updated: ${resultCount}`
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
export const job20230421 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
