import { prisma, type Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-05-08_permissions',
	title: 'Add permissions defs',
	createdBy: 'Joe Karow',
}

const permissions: Prisma.PermissionCreateManyInput[] = [
	{
		name: 'dataPortalBasic',
		description: 'View basic Data Portal pages/modules',
	},
	{
		name: 'dataPortalAdmin',
		description: 'View admin Data Portal pages/modules',
	},
	{
		name: 'dataPortalManager',
		description: 'View manager Data Portal pages/modules',
	},
]

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const result = await prisma.permission.createMany({
		data: permissions,
		skipDuplicates: true,
	})

	task.output = `Permissions added: ${result.count}`
	/**
	 * DO NOT REMOVE BELOW - This writes a record to the DB to register that this migration has run
	 * successfully.
	 */
	await jobPostRunner(jobDef)
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
export const job20230508 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
