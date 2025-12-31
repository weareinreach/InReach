import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-12-10_add-mexico-city-federal-entity',
	title: 'Add MExico City (MX-CMX) as a federal entity',
	createdBy: 'Diana Garbarino',
	description: 'Adds the official record for Mexico City (CDMX) with ISO code MX-CMX.',
}

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20251210_add_mexico_city_federal_entity = {
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

		const mexicoCity = await prisma.govDist.create({
			data: {
				id: generateId('govDist'),
				name: 'Mexico City',
				slug: 'mx-ciudad-de-mexico',
				iso: 'MX-CMX',
				abbrev: 'CDMX',
				country: {
					connect: { cca2: 'MX' }, // Connect to Mexico
				},
				govDistType: {
					connect: { id: 'gdty_01GW2HHHXA3BSAEK26BGXM5X4N' }, // Connect to 'federal-entity' type
				},
				key: {
					create: {
						key: 'mx-ciudad-de-mexico',
						ns: 'gov-dist',
						text: 'Mexico City',
					},
				},
			},
		})
		log(`Created govDist record for ${mexicoCity.name} (${mexicoCity.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
