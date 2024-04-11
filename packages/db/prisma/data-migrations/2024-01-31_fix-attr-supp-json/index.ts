import { isSuperJSONResult, superjson } from '@weareinreach/util/transformer'
import { Prisma } from '~db/client'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-01-31_fix-attr-supp-json',
	title: 'fix attr supp json',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240131_fix_attr_supp_json = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
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

		const { default: nullIds } = await import('./nulls.json')

		const nullJson = await prisma.attributeSupplement.updateMany({
			where: { id: { in: nullIds } },
			data: {
				data: Prisma.DbNull,
			},
		})
		log(`Cleared ${nullJson.count} null fields`)

		const { default: suppIds } = await import('./serialize.json')
		const data = await prisma.attributeSupplement.findMany({
			where: {
				id: { in: suppIds },
			},
			select: {
				id: true,
				data: true,
			},
		})

		const correctedData = data.map(({ id, data }) => ({
			where: { id },
			data: {
				data: (isSuperJSONResult(data)
					? superjson.deserialize(data)
					: typeof data === 'string'
						? superjson.parse(data)
						: data) as unknown as Prisma.InputJsonValue,
			},
		}))
		const total = correctedData.length
		let i = 1
		while (correctedData.length) {
			const batch = correctedData.splice(0, 100)
			log(`[BATCH] Processing records ${i}-${i + batch.length - 1} of ${total}`)
			const result = await prisma.$transaction(batch.map((args) => prisma.attributeSupplement.update(args)))
			log(`Updated ${result.length} records`)
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
