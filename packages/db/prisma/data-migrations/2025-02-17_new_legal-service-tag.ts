import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-02-17_new-legal-service-tag',
	title: 'new legal service tag',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250217_new_legal_service_tag = {
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

		const legalServiceTag = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01J4044WXYZS9V6F5R7M3L8XCY',
				name: 'Legal information and referrals',
				active: true,
				categories: {
					create: { active: true, category: { connect: { id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } } },
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } },
				key: {
					create: {
						key: 'legal.legal-info-referrals',
						text: 'Legal information and referrals',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})
		log(`Created service tag: ${legalServiceTag.name} (${legalServiceTag.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
