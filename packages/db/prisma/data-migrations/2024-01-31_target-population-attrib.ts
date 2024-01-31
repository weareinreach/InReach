import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-01-31_target-population-attrib',
	title: 'target population attrib',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240131_target_population_attrib = {
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

		const attributeId = 'attr_01HNG5GDC5MXW30F32FWJNJ98C'
		const categoryId = 'attc_01HNG5BPYJADWX4YFVNENS3TRD'

		const targetPopCat = await prisma.attributeCategory.createMany({
			data: [
				{
					id: categoryId,
					name: 'Target Population',
					tag: 'target-population',
					active: true,
					ns: 'attribute',
				},
			],
			skipDuplicates: true,
		})
		log(`Created category: ${targetPopCat.count}`)
		const tPopAttrTKey = await prisma.translationKey.createMany({
			data: [
				{
					key: 'tpop.other',
					ns: 'attribute',
					text: 'Target Population - Other',
				},
			],
			skipDuplicates: true,
		})
		log(`Created tKey: ${tPopAttrTKey.count}`)

		const targetPopAttr = await prisma.attribute.createMany({
			data: [
				{
					id: attributeId,
					name: 'Target Population - Free Text',
					tag: 'tpop-other',
					tsKey: 'tpop.other',
					tsNs: 'attribute',
					requireText: true,
				},
			],
			skipDuplicates: true,
		})
		log(`Created attribute: ${targetPopAttr.count}`)
		const attrToCat = await prisma.attributeToCategory.createMany({
			data: [
				{
					attributeId,
					categoryId,
				},
			],
			skipDuplicates: true,
		})
		log(`Created Attribute/Category link: ${attrToCat.count}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
