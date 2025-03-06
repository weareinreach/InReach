import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-03-05_update-attribute-values-lang-inter',
	title: 'change the name values for All Languages',
	createdBy: 'Diana Garbarino',
	/** Optional: Longer description for the job */
	description: 'change the name values for All Languages',
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250305_update_attribute_values_lang_inter = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		// Variables for the update
		const key = 'lang.all-languages-by-interpreter'
		const ns = 'attribute'
		const newTextValue = 'Language assistance available. Contact for more information.'
		// Perform the update
		const update1 = await prisma.translationKey.update({
			where: { ns_key: { key, ns } },
			data: { text: newTextValue },
		})

		log(`Updated translationKey: ${update1.key} with new text: "${update1.text}"`)

		const update2 = await prisma.attribute.updateMany({
			where: { tsKey: key, tsNs: ns },
			data: { name: newTextValue },
		})

		log(`Updated ${update2.count} attributes with new name: "${newTextValue}"`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
