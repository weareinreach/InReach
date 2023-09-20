import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-20-update-services',
	title: 'update services',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230920_update_services = {
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

		const tRelo = ['osvc_01H299KEES84DAC2VA0XVH935H', 'osvc_01H299KDJ9TCMS7WWZVQYBBK9Z']
		const tGaCare = [
			'osvc_01GVXX0XAHVM11QWABDPYTZ93Q',
			'osvc_01H299KDJ9TCMS7WWZVQYBBK9Z',
			'osvc_01H299KEES84DAC2VA0XVH935H',
		]
		await prisma.$transaction(async (db) => {
			const reloTag = await db.orgServiceTag.createMany({
				data: tRelo.map((serviceId) => ({
					serviceId,
					tagId: 'svtg_01HADA68N465FMV5P6XYD4VQBV',
					active: true,
				})),
				skipDuplicates: true,
			})
			log(`Created ${reloTag.count} tags for ${tRelo.length} services`)
			const gaCareTag = await db.orgServiceTag.createMany({
				data: tGaCare.map((serviceId) => ({
					serviceId,
					tagId: 'svtg_01HAD99DSF7TH2HDXNYC331BVN',
					active: true,
				})),
				skipDuplicates: true,
			})
			log(`Created ${gaCareTag.count} tags for ${tGaCare.length} services`)
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
