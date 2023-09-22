import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-09-22-service-areas',
	title: 'service areas',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20230922_service_areas = {
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
		const countryId = 'ctry_01GW2HHDK9M26M80SG63T21SVH'
		const serviceAreaC = await prisma.serviceAreaCountry.createMany({
			data: [
				{
					serviceAreaId: 'svar_01H56ESE0Y8CXJAA9N9DAZ295R',
					countryId,
				},
				{
					serviceAreaId: 'svar_01H29ENFH36S5EDJ5TXV3RCDZF',
					countryId,
				},
				{
					serviceAreaId: 'svar_01H29ENFGZACTZTZY2S4HDVQ5N',
					countryId,
				},
				{
					serviceAreaId: 'svar_01H56ESDYKHW5W5EK02XJ4RFZH',
					countryId,
				},
			],
			skipDuplicates: true,
		})
		log(`Service areas updated: ${serviceAreaC.count}`)

		const orgLocationServ = await prisma.orgLocationService.createMany({
			data: [
				{
					orgLocationId: 'oloc_01H299KDJ5158R5JW6TY02Q9S3',
					serviceId: 'osvc_01H299KDJ9TCMS7WWZVQYBBK9Z',
					active: true,
				},
				{
					orgLocationId: 'oloc_01H299KEERBMZVAJPN5WZJN32E',
					serviceId: 'osvc_01H299KEES84DAC2VA0XVH935H',
				},
			],
			skipDuplicates: true,
		})
		log(`Location/Service links: ${orgLocationServ.count}`)

		const orgLocationUpdates = await prisma.orgLocation.updateMany({
			where: { id: { in: ['oloc_01H299KDJ5158R5JW6TY02Q9S3', 'oloc_01H299KEERBMZVAJPN5WZJN32E'] } },
			data: {
				mailOnly: true,
				notVisitable: true,
				published: true,
			},
		})
		log(`Locations updated: ${orgLocationUpdates.count}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
