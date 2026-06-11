import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2026-06-11_add-italian-language',
	title: 'Add Italian to active languages',
	createdBy: 'Developer',
	/** Optional: Longer description for the job */
	description: 'Sets Italian (it) as an actively translated language in the database.',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20260611_add_italian_language = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		const language = await prisma.language.upsert({
			where: { localeCode: 'it' },
			update: {
				activelyTranslated: true,
			},
			create: {
				localeCode: 'it',
				languageName: 'Italian',
				nativeName: 'Italiano',
				activelyTranslated: true,
			},
		})

		log(`Language updated: ${language.languageName} (${language.localeCode}) is now set to active.`)

		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
