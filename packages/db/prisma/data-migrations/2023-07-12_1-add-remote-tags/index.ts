import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { type Prisma, prisma } from '~db/index'
import { raise } from '~db/prisma/common'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-12_1-add-remote-tags',
	title: 'Add remote tags from sheet',
	createdBy: 'Joe Karow',
}

const Schema = z
	.object({ legacyId: z.string(), legacyServiceId: z.string(), remote: z.coerce.boolean() })
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
export const job20230712a = {
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

		const servIds = await prisma.orgService.findMany({
			select: { id: true, legacyId: true },
		})
		const servIdMap = new Map(servIds.map(({ id, legacyId }) => [legacyId, id]))

		// offers-remote-services
		const attributeId = 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M'
		// Do stuff
		const data = Schema.parse(JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8')))
		task.output = `Loaded ${data.length} rows.`
		const additions: Prisma.ServiceAttributeCreateManyInput[] = []
		const exceptions: typeof data = []

		for (const item of data) {
			const { remote } = item
			if (!remote) continue
			const orgServiceId = servIdMap.get(item.legacyServiceId)
			if (!orgServiceId) {
				exceptions.push(item)
				continue
			}
			additions.push({
				orgServiceId,
				attributeId,
			})
		}
		task.output = `Processed data with ${exceptions.length} exceptions.`
		task.output = `Adding ${additions.length} remote tags.`

		const result = await prisma.serviceAttribute.createMany({
			data: additions,
			skipDuplicates: true,
		})

		task.output = `Successful additions: ${result.count}`
		if (exceptions.length) {
			const exceptionFilePath = path.resolve(__dirname, '!exceptions.json')
			task.output = `Writing ${exceptions.length} exceptions to ${exceptionFilePath}`
			fs.writeFileSync(exceptionFilePath, JSON.stringify(exceptions))
		}
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
