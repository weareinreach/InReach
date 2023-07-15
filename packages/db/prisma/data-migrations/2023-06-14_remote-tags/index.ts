import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { type ListrJob, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-14_remote-tags',
	title: 'Add "remote" tag to services',
	createdBy: 'Joe Karow',
}

const Schema = z
	.object({
		organizationId: z.string(),
		serviceId: z.string(),
	})
	.array()

/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230614a = {
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

		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')))

		const attributeId = 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M'

		const updates = await prisma.serviceAttribute.createMany({
			data: data.map(({ serviceId: orgServiceId }) => ({ attributeId, orgServiceId })),
			skipDuplicates: true,
		})

		task.output = `"Remote" tags added: ${updates.count} out of ${data.length} submitted`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
