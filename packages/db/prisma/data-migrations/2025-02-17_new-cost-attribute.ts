import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-02-17_new-cost-attribute',
	title: 'new cost attribute',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250217_new_cost_attribute = {
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

		await prisma.$transaction(async (tx) => {
			const financialAsst = await tx.attribute.create({
				data: {
					id: 'attr_01J4044WXYZV6X8B3N2J7M5T9P',
					tag: 'cost-financial-assistance-available',
					name: 'Financial assistance available',
					active: true,
					canAttachTo: ['SERVICE'],
					categories: { create: { categoryId: 'attc_01GW2HHFVFKNMYPN8F86M0H576' } },
					icon: 'carbon:piggy-bank',
					key: {
						create: {
							key: 'cost.cost-financial-assistance-available',
							text: 'Financial assistance available',
							ns: 'attribute',
							active: true,
						},
					},
				},
			})
			log(`Created "${financialAsst.name}" (${financialAsst.id})`)
		})

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
