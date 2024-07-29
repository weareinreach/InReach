import { writeFileSync } from 'fs'
import { resolve } from 'path'

import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-07-29_address-visibility-update',
	title: 'address visibility update',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240729_address_visibility_update = {
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

		const results = await prisma.orgLocation.updateMany({
			where: {
				OR: [
					{
						services: {
							some: {
								service: {
									services: {
										some: {
											tagId: {
												in: [
													'svtg_01GW2HHFBPG92H7F9REAG9T2X5',
													'svtg_01GW2HHFBNJ4CGGZATZZS8DZWR',
													'svtg_01GW2HHFBPZFZF43FEHPV32JC8',
												],
											},
										},
									},
								},
							},
						},
					},
					{ organization: { attributes: { some: { attributeId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW' } } } },
					{ attributes: { some: { attributeId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW' } } },
				],
				addressVisibility: { not: 'FULL' },
			},
			data: { addressVisibility: 'FULL' },
		})
		log(`Updated ${results.count} locations`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
