import { prisma } from '~db/client'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

import { type Output } from './!prep'

type Data = Pick<Output, 'orgPhone' | 'orgLocationPhone' | 'orgServicePhone' | 'translationKey' | 'freeText'>
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-21-add-missing-phones',
	title: 'add missing phones',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231121_add_missing_phones = {
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
		const data = (await downloadFromDatastore(
			'migrations/2023-11-21_add-missing-phones/data.json',
			log
		)) as Data

		const translationKey = await prisma.translationKey.createMany({
			data: data.translationKey,
			skipDuplicates: true,
		})
		log(`Translation Keys -- Submitted: ${data.translationKey.length}, Created: ${translationKey.count}`)
		const freeText = await prisma.freeText.createMany({ data: data.freeText, skipDuplicates: true })
		log(`Free Text -- Submitted: ${data.freeText.length}, Created: ${freeText.count}`)

		const orgPhone = await prisma.orgPhone.createMany({
			data: data.orgPhone,
			skipDuplicates: true,
		})
		log(`OrgPhone -- Submitted: ${data.orgPhone.length}, Created: ${orgPhone.count}`)
		const orgLocationPhone = await prisma.orgLocationPhone.createMany({
			data: data.orgLocationPhone,
			skipDuplicates: true,
		})
		log(`OrgLocationPhone -- Submitted: ${data.orgLocationPhone.length}, Created: ${orgLocationPhone.count}`)
		const orgServicePhone = await prisma.orgServicePhone.createMany({
			data: data.orgServicePhone,
			skipDuplicates: true,
		})
		log(`OrgServicePhone -- Submitted: ${data.orgServicePhone.length}, Created: ${orgServicePhone.count}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
