import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-07-29_new-service-tags',
	title: 'new service tags',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240729_new_service_tags = {
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

		const selfAdvocate = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01J4044WXYZR5YA52JG1Q5FDF2',
				name: 'Self-Advocacy Information',
				active: false,
				categories: {
					create: { active: false, category: { connect: { id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } } },
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX' } },
				key: {
					create: {
						key: 'legal.self-advocacy-information',
						text: 'Self-Advocacy Information',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})
		log(`Created service tag: ${selfAdvocate.name} (${selfAdvocate.id})`)
		const advocacyOrg = await prisma.serviceTag.create({
			data: {
				id: 'svtg_01J4044WXYVFRA8R6JJSDCF7WT',
				name: 'Advocacy and Community Organizing',
				active: false,
				categories: {
					createMany: {
						data: [
							{ active: false, categoryId: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3' },
							{ active: false, categoryId: 'svct_01GW2HHEVDX898ZT0QGM471WMV' },
						],
					},
				},
				primaryCategory: { connect: { id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3' } },
				key: {
					create: {
						key: 'community-support.advocacy-and-community-organizing',
						text: 'Advocacy and Community Organizing',
						namespace: { connect: { name: 'services' } },
					},
				},
			},
		})

		log(`Created service tag: ${advocacyOrg.name} (${advocacyOrg.id})`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
