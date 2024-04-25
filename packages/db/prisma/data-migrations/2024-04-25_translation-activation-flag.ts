import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-04-25_translation-activation-flag',
	title: 'translation activation flag',
	createdBy: 'JoeKarow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240425_translation_activation_flag = {
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
		const unpublishedOrDeleted = {
			OR: [{ published: false }, { deleted: true }] as [{ published: false }, { deleted: true }],
		}
		const notActive = { active: false }
		const totalKeys = await prisma.translationKey.count()
		// Do stuff
		const update = await prisma.translationKey.updateMany({
			where: {
				OR: [
					{ attribute: notActive },
					{
						freeText: {
							OR: [
								{
									AttributeSupplement: {
										OR: [
											notActive,
											{ attribute: notActive },
											{ location: unpublishedOrDeleted },
											{ organization: unpublishedOrDeleted },
											{ service: unpublishedOrDeleted },
										],
									},
								},
								{ Organization: unpublishedOrDeleted },
								{ OrgEmail: unpublishedOrDeleted },
								{ OrgLocation: unpublishedOrDeleted },
								{ OrgPhone: unpublishedOrDeleted },
								{ OrgService: unpublishedOrDeleted },
								{ OrgServiceName: unpublishedOrDeleted },
								{ OrgWebsite: unpublishedOrDeleted },
							],
						},
					},
				],
			},
			data: {
				active: false,
			},
		})
		log(`Deactivated ${update.count} translation keys. (Total keys: ${totalKeys})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
