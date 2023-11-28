import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-20-fix-listing',
	title: 'fix listing',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231120_fix_listing = {
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

		const orgLocationId = 'oloc_01H299KEBZ3ZVF1653PXJ3MEH5'
		const services = [
			'osvc_01H299KEC0MRBCN9RGRGVVM2FY',
			'osvc_01H299KEC2JDB0PSYJR94ZYHY8',
			'osvc_01H299KEC4NRQE5C15W0R42SAA',
			'osvc_01H299KEC66C1ZZ0BYENYEWCS3',
		]

		const updateServices = await prisma.orgLocationService.createMany({
			data: services.map((serviceId) => ({ serviceId, orgLocationId })),
			skipDuplicates: true,
		})
		log(`Created ${updateServices.count} orgLocationService records`)

		const updateLocation = await prisma.orgLocation.update({
			where: { id: 'oloc_01H299KEBZ3ZVF1653PXJ3MEH5' },
			data: { published: true, mapCityOnly: true, notVisitable: true },
		})
		log(`Updated orgLocation ${updateLocation.id}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
