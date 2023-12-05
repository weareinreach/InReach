import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

const Schema = z
	.object({
		id: z.string(),
		url: z.string().url(),
		organizationId: z.string(),
	})
	.array()

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-17-add-missing-websites',
	title: 'add missing websites',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231117_add_missing_websites = {
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

		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8')))

		const addedSites = await prisma.orgWebsite.createMany({
			data,
			skipDuplicates: true,
		})
		log(`Added ${addedSites.count} org websites`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
