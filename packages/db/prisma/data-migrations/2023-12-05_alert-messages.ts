import { type Prisma, prisma } from '~db/client'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

type Data = {
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	deactivateOld: Prisma.AttributeSupplementUpdateManyArgs
	reactivateAttrib: Prisma.OrganizationAttributeUpdateManyArgs
}

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-12-05_alert-messages',
	title: 'alert messages',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231205_alert_messages = {
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
		log(`Downloading data from datastore`)
		const data = (await downloadFromDatastore(`migrations/${jobDef.jobId}/data.json`, log)) as Data
		const translationKey = await prisma.translationKey.createMany({
			data: data.translationKey,
			skipDuplicates: true,
		})
		log(`Created ${translationKey.count} translation keys`)
		const freeText = await prisma.freeText.createMany({
			data: data.freeText,
			skipDuplicates: true,
		})
		log(`Created ${freeText.count} freetext records`)
		const organizationAttribute = await prisma.organizationAttribute.createMany({
			data: data.organizationAttribute,
			skipDuplicates: true,
		})
		log(`Created ${organizationAttribute.count} organization attribute records`)
		const attributeSupplements = await prisma.attributeSupplement.createMany({
			data: data.attributeSupplement,
			skipDuplicates: true,
		})
		log(`Created ${attributeSupplements.count} attribute supplement records`)

		const deactivatedAlerts = await prisma.attributeSupplement.updateMany(data.deactivateOld)
		log(`Deactivated alerts: ${deactivatedAlerts.count}`)

		const reactivatedAttrib = await prisma.organizationAttribute.updateMany(data.reactivateAttrib)
		log(`Reactivated attributes: ${reactivatedAttrib.count}`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
