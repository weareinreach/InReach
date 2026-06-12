import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '20260611000000_backfill_search_arrays',
	title: 'Backfill Organization Search Arrays',
	createdBy: 'Developer',
	/** Optional: Longer description for the job */
	description: 'Backfills materialized attributeIds and serviceIds for all organizations.',
}

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20260611_backfill_search_arrays = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		log('🚀 Starting Search Array Backfill...')

		const result = await prisma.$executeRawUnsafe(`
			UPDATE "Organization" o SET
				"attributeIds" = ARRAY(
					SELECT DISTINCT asup."attributeId"
					FROM "AttributeSupplement" asup
					LEFT JOIN "OrgLocation" loc ON asup."locationId" = loc.id
					LEFT JOIN "OrgService" os ON asup."serviceId" = os.id
					WHERE (asup."organizationId" = o.id OR loc."orgId" = o.id OR os."organizationId" = o.id)
						AND asup.active = true
				),
				"serviceIds" = ARRAY(
					SELECT DISTINCT ost."tagId"
					FROM "OrgServiceTag" ost
					JOIN "OrgService" os ON ost."serviceId" = os.id
					WHERE os."organizationId" = o.id AND ost.active = true
				);
		`)

		log(`✅ Backfill complete. Rows affected: ${result}`)

		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
