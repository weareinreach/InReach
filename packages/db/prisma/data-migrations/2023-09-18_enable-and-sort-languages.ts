import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-18-enable-and-sort-languages',
	title: 'enable & sort languages',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230918_enable_and_sort_languages = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
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
		const commonLangs = ['en', 'es', 'fr', 'ar', 'ru', 'zh']
		const updateCommon = await prisma.language.updateMany({
			where: { localeCode: { in: commonLangs } },
			data: { groupCommon: true },
		})
		log(`Updated ${updateCommon.count} languages to common group`)
		const sortEn = await prisma.language.update({ where: { localeCode: 'en' }, data: { defaultSort: 0 } })
		log(`Updated defaultSort for ${sortEn.languageName} to ${sortEn.defaultSort}`)
		const sortEs = await prisma.language.update({ where: { localeCode: 'es' }, data: { defaultSort: 10 } })
		log(`Updated defaultSort for ${sortEs.languageName} to ${sortEs.defaultSort}`)
		const sortFr = await prisma.language.update({ where: { localeCode: 'fr' }, data: { defaultSort: 20 } })
		log(`Updated defaultSort for ${sortFr.languageName} to ${sortFr.defaultSort}`)

		const langsToEnable = ['zh', 'ja', 'ko', 'pl', 'pt', 'uk']

		const enabledLangs = await prisma.language.updateMany({
			where: { localeCode: { in: langsToEnable } },
			data: { activelyTranslated: true },
		})
		log(`Enabled ${enabledLangs.count} languages`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
