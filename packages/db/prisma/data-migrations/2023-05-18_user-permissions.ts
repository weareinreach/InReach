import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-05-18_user-permissions',
	title: 'Add permissions to selected users',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const usersToUpdate = [
		'user_01GW2HQV2PGTH4VA81M9RV8EMV',
		'user_01GW2HQV3JR28PE89Q06BB35EC',
		'user_01GW2HQV318QMB9AVPJ6JJ5DBN',
	]
	const permissionToAdd = 'perm_01GW2HKXRTRWKY87HNTTFZCBH1'

	const updatedUsers = await prisma.userPermission.createMany({
		data: usersToUpdate.map((userId) => ({ userId, permissionId: permissionToAdd })),
		skipDuplicates: true,
	})
	task.output = `Users updated: ${updatedUsers.count}`
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
export const job20230518 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
