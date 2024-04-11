import { z } from 'zod'

import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-03-11_hide-locations',
	title: 'hide locations',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const DeactivateIdsSchema = z.array(z.string())
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240311_hide_locations = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, downloadFromDatastore, formatMessage, jobPostRunner, prisma } = ctx
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

		log(`Downloading locations to hide from datastore`)
		const hideLocationSlugs = await downloadFromDatastore(
			'migrations/2024-03-11_hide-locations/hideLocations.json',
			log
		).then((data) => DeactivateIdsSchema.parse(data))
		const hideLocations = await prisma.orgLocation.updateMany({
			where: {
				organization: {
					slug: { in: hideLocationSlugs },
				},
			},
			data: {
				notVisitable: true,
			},
		})

		log(`Updated ${hideLocations.count} location records`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
