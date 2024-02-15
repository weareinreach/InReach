import { z } from 'zod'

import { prisma, Prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

import data from './data.json'

const Schema = z
	.object({
		where: z.object({ tag: z.string() }),
		data: z.object({
			canAttachTo: z
				.enum(['SERVICE', 'ORGANIZATION', 'LOCATION', 'USER'])
				.array()
				.transform((x) => ({ set: x })),
		}),
	})
	.array()

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-15_attribute-attachments',
	title: 'attribute attachments',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240215_attribute_attachments = {
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
		const parsed = Schema.parse(data)

		const updates = await prisma.$transaction(
			parsed.map((args) => {
				return prisma.attribute.update(args)
			})
		)

		log(`Updated ${updates.length} records.`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
