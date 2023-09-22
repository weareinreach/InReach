import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-12-update-crowdin-ids',
	title: 'update crowdin ids',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
const Schema = z.object({ crowdinId: z.number(), key: z.string(), ns: z.string() }).array()
/** Job export - this variable MUST be UNIQUE */
export const job20230912_update_crowdin_ids = {
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

		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')))

		const updates = await prisma.$transaction(
			data.map(({ key, ns, crowdinId }) =>
				prisma.translationKey.update({ where: { ns_key: { ns, key } }, data: { crowdinId } })
			)
		)

		log(`Records updated: ${updates.length}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
