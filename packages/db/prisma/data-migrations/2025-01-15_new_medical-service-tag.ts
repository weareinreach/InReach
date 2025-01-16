import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-15_new-medical-service-tags',
	title: 'new service tags',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250115_new_medical_service_tags = {
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

		const medicalTag = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01GW2HHFBXY9V3KJZR4MND7YPQ',
				name: 'Medical information and referrals',
				active: false,
				categories: {
					create: { active: true, category: { connect: { id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } } },
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390' } },
				key: {
					create: {
						key: 'medical.medical-info-and-referrals',
						text: 'Medical information and referrals',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})
		log(`Created service tag: ${medicalTag.name} (${medicalTag.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
