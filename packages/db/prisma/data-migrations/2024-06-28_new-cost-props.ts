import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-06-28_new-cost-props',
	title: 'new cost props',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240628_new_cost_props = {
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
			const slidingScale = await tx.attribute.create({
				data: {
					id: 'attr_01J1FYH8F5GHPSFYDQVQY8VYPM',
					tag: 'cost-sliding-scale',
					name: 'Costs determined on a sliding scale',
					active: true,
					canAttachTo: ['SERVICE'],
					categories: { create: { categoryId: 'attc_01GW2HHFVFKNMYPN8F86M0H576' } },
					icon: 'carbon:piggy-bank',
					key: {
						create: {
							key: 'cost.cost-sliding-scale',
							text: 'Costs determined on a sliding scale',
							ns: 'attribute',
							interpolation: 'CONTEXT',
							interpolationValues: {
								default:
									'This service has sliding scale fees. The amount you pay for services is adjusted according to your income level. Contact the organization directly for more information.',
								withUrl:
									'This service has sliding scale fees. The amount you pay for services is adjusted according to your income level. <Link href="{{url}}">Click here to visit the organization\'s page for more information.</Link>',
							},
						},
					},
				},
			})
			log(`Created "${slidingScale.name}" (${slidingScale.id})`)

			const acceptsInsurance = await tx.attribute.create({
				data: {
					id: 'attr_01J1FYH8F5YX6T1GD7SB0QTCJQ',
					tag: 'cost-accepts-insurance',
					name: 'This service accepts insurance',
					active: true,
					canAttachTo: ['SERVICE'],
					categories: { create: { categoryId: 'attc_01GW2HHFVFKNMYPN8F86M0H576' } },
					icon: 'carbon:piggy-bank',
					key: {
						create: {
							key: 'cost.cost-accepts-insurance',
							text: 'This service accepts insurance',
							ns: 'attribute',
							interpolation: 'CONTEXT',
							interpolationValues: {
								default:
									'This service accepts insurance. Contact the organization directly for more information on cost, financial assistance options and insurance coverage details.',
								withUrl:
									'This service accepts insurance. <Link href="{{url}}">Click here to visit the organization\'s page</Link> for more information on cost, financial assistance options and insurance coverage details.',
							},
						},
					},
				},
			})
			log(`Created "${acceptsInsurance.name}" (${acceptsInsurance.id})`)
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
