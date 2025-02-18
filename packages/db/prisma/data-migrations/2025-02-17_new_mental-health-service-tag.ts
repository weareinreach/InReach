import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-02-17_new-mental-health-service-tag',
	title: 'new mental health service tag',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250217_new_mental_health_service_tag = {
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

		const mentalHealthTag = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01J4044WXYZRWK3Q9JH2Y4F8B0',
				name: 'Mental health information and referrals',
				active: false,
				categories: {
					create: { active: true, category: { connect: { id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ' } } },
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ' } },
				key: {
					create: {
						key: 'mental-health-info-referrals',
						text: 'Mental health information and referrals',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})
		log(`Created service tag: ${mentalHealthTag.name} (${mentalHealthTag.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
