import { prisma, Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'
import { type AttributeData } from '~db/seed/data/09-attributes'
import { seedAttributes } from '~db/seed/starter/09-attributes'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-11-permissions-attributes',
	title: 'Create additional permission & attribute records',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	const attributesToAdd: AttributeData = [
		{
			name: 'Alerts',
			description: 'Alert messages',
			ns: 'alerts',
			attributes: [
				{
					key: 'info',
					name: 'Informational Alert',
					icon: 'carbon:information-filled',
					requireText: true,
				},
				{
					key: 'warn',
					name: 'Warning Alert',
					icon: 'carbon:warning-filled',
					requireText: true,
				},
			],
		},
	]

	const rolesToAdd: Prisma.PermissionCreateManyInput[] = [
		{
			name: 'alertOrg',
			description: 'Manage organization alerts.',
		},
		{
			name: 'alertLoc',
			description: 'Manage location alerts.',
		},
		{
			name: 'alertService',
			description: 'Manage service alerts.',
		},
	]

	await seedAttributes(task, attributesToAdd)

	const permissionCreate = await prisma.permission.createMany({ data: rolesToAdd, skipDuplicates: true })
	task.output = `Permissions created: ${permissionCreate.count}`
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
export const job20230411b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
