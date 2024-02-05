import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

const DataSchema = z
	.object({
		id: z.string(),
		attributeId: z.string(),
		active: z.boolean(),
		organizationId: z.string().nullable(),
		locationId: z.string().nullable(),
		serviceId: z.string().nullable(),
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
	})
	.array()

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-01_add-missing-attributes',
	title: 'add missing attributes',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240201_add_missing_attributes = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff
		const rawData = fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')
		const data = DataSchema.parse(JSON.parse(rawData))
		const total = data.length
		let i = 1
		while (data.length) {
			const batch = data.splice(0, 1000)
			log(`[BATCH] Processing records ${i}-${i + batch.length - 1} of ${total}`)
			const result = await prisma.attributeSupplement.createMany({ data: batch, skipDuplicates: true })
			log(`[BATCH] Created ${result.count} records`)
			i = i + batch.length
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
