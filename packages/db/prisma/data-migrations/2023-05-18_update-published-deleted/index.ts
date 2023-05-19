import { ListrTaskEventType } from 'listr2'
import { parse } from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { batchRunner } from '~db/prisma/batchRunner'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

import { type DataOutput } from './!generate'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-05-18_update-published-deleted',
	title: 'Update published/deleted fields for updates after 2023-03-20',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	if (await jobPreRunner(jobDef, task)) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */

	const dataFile = path.resolve(__dirname, './data.json')
	if (!fs.existsSync(dataFile)) return task.skip(`${jobDef.jobId} - Data file not found!.`)

	const data = parse<DataOutput>(fs.readFileSync(dataFile, 'utf-8'))

	return task.newListr((parentTask) => [
		{
			title: 'Update organizations',
			task: async () => {
				// createLogger(parentTask, jobDef)
				await batchRunner(
					data.organization.map((args) => prisma.organization.update(args)),
					parentTask
				)
			},
		},
		{
			title: 'Update email addresses',
			task: async () =>
				await batchRunner(
					data.orgEmail.map((args) => prisma.orgEmail.update(args)),
					parentTask
				),
		},
		{
			title: 'Update locations',
			task: async () =>
				await batchRunner(
					data.orgLocation.map((args) => prisma.orgLocation.update(args)),
					parentTask
				),
		},
		{
			title: 'Update phone numbers',
			task: async () =>
				await batchRunner(
					data.orgPhone.map((args) => prisma.orgPhone.update(args)),
					parentTask
				),
		},
		{
			title: 'Update service entries',
			task: async () =>
				await batchRunner(
					data.orgService.map((args) => prisma.orgService.update(args)),
					parentTask
				),
		},
		{
			title: 'Mark migration as completed',
			task: async () => await jobPostRunner(jobDef),
		},
	])

	/**
	 * DO NOT REMOVE BELOW - This writes a record to the DB to register that this migration has run
	 * successfully.
	 */
	// await jobPostRunner(jobDef)
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
export const job20230518b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
