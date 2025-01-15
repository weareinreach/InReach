import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-15_new-food-service-tags',
	title: 'new service tags',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250115_new_food_service_tags = {
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

		const hotMeals = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01GW2HHFBZ4D5XHQJSN29GF8TZ7',
				name: 'Hot meals',
				active: true,
				categories: {
					create: { active: true, category: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } } },
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV' } },
				key: {
					create: {
						key: 'food.hot-meals',
						text: 'Hot meals',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})
		log(`Created service tag: ${hotMeals.name} (${hotMeals.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
