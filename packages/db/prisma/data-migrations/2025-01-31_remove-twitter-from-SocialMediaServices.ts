import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-01-31_remove-twitter-from-SocialMediaServices',
	title: 'remove twitter from social media services',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'remove twitter from social media services',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250131_remove_twitter_from_social_media_services = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		const update = await prisma.socialMediaService.update({
			where: { id: 'smsv_01GW2HHE8KK4BX2DXWGJ0187VJ' },
			data: { active: false },
		})

		log(`set twitter active status to false`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
