import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-11-fix-unsupported-attrib-data',
	title: 'fix unsupported attrib data',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230911_fix_unsupported_attrib_data = {
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
		const Schema = z.object({ id: z.string(), data: z.record(z.any()) }).array()
		const updateData = Schema.parse(
			JSON.parse(fs.readFileSync(path.resolve(__dirname, './corrected.json'), 'utf-8'))
		)

		const updates = updateData.map(({ id, data }) =>
			prisma.attributeSupplement.update({ where: { id }, data: { data } })
		)

		const results = await prisma.$transaction(updates)

		log(`Updates submitted: ${updates.length}, Updates processed: ${results.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
