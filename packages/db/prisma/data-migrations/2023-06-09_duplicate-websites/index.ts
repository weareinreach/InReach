import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

const getJSON = (file: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf-8'))
const Schema = z.object({ id: z.string() }).array()
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-09_duplicate-websites',
	title: 'Deduple websites',
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
export const job20230609a = {
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

		const data = Schema.parse(getJSON('data.json'))

		const result = await prisma.orgWebsite.updateMany({
			where: { id: { in: data.map(({ id }) => id) } },
			data: { published: false },
		})

		task.output = `Websites unpublished: ${result.count}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
