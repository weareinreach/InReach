import { addSingleKeyFromNestedFreetextCreate } from '@weareinreach/crowdin/api'
import { generateNestedFreeText } from '~db/lib/generateFreeText'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-08-22_election-alert',
	title: 'election alert',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240822_election_alert = {
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

		// Do stuff

		const alertId = 'alrt_01J5XNBQ5GREHSHK5D2QTCXRWE'

		const alertText = generateNestedFreeText({
			type: 'locationAlert',
			freeTextId: 'ftxt_01J5XNC3P8HS8SWHGBB546D4RA',
			itemId: alertId,
			text: "🇺🇸 US Citizens: <Link href='https://www.headcount.org/vote-with-pride/'>Make sure you're registered and ready to vote with pride on November 5, 2024!</Link>",
		})

		await prisma.$transaction(async (tx) => {
			const crowdIn = await addSingleKeyFromNestedFreetextCreate(alertText)

			const newAlert = await tx.locationAlert.create({
				data: {
					id: alertId,
					level: 'WARN_PRIMARY',
					text: alertText,
					country: {
						connect: { cca2: 'US' },
						// 	[
						// 	{ cca2: 'AS' },
						// 	{ cca2: 'GU' },
						// 	{ cca2: 'MH' },
						// 	{ cca2: 'MP' },
						// 	{ cca2: 'PR' },
						// 	{ cca2: 'PW' },
						// 	{ cca2: 'UM' },
						// 	{ cca2: 'US' },
						// 	{ cca2: 'VI' },
						// ],
					},
				},
			})
			log(`Created alert ${newAlert.id}. Crowdin id: ${crowdIn.id}`)
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
