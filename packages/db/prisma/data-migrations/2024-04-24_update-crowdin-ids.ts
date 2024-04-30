import ms from 'ms'
import { z } from 'zod'

import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

const DataSchema = z
	.object({
		key: z.string(),
		ns: z.string(),
		crowdinId: z.number(),
	})
	.array()

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-04-24_update-crowdin-ids',
	title: 'update crowdin ids',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240424_update_crowdin_ids = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, downloadFromDatastore, generateId, formatMessage, jobPostRunner, prisma } = ctx
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

		const crowdinIds = DataSchema.parse(
			await downloadFromDatastore('migrations/2024-04-24_update-crowdin-ids/data.json', log)
		)
		const dbArgs = crowdinIds.map(({ crowdinId, key, ns }) => ({
			where: { ns_key: { ns, key } },
			data: { crowdinId },
			select: { key: true, crowdinId: true },
		}))
		const totalCount = dbArgs.length
		let i = 1

		const updates = await prisma.$transaction(
			async (tx) => {
				const results: { key: string; crowdinId: number | null }[] = []

				while (dbArgs.length) {
					const batch = dbArgs.splice(0, 100)
					log(`Processing records ${i} - ${i + batch.length - 1} of ${totalCount}`)
					for (const args of batch) {
						const update = await tx.translationKey.update(args)
						results.push(update)
					}
					i += batch.length
				}

				return results
			},
			{ timeout: ms('15m') }
		)

		log(`Updated ${updates.length} translation keys`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
