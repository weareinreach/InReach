import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

import { type Output } from './!prep-single'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-02-20_appsheet-load',
	title: 'appsheet load',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240220_appsheet_load = {
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

		log(`Downloading data from datastore`)
		const data = (await downloadFromDatastore('migrations/2024-02-20_appsheet-load/data.json', log)) as Output

		await prisma.$transaction(
			async (tx) => {
				let i = 1
				const total = data.records.length
				for (const record of data.records) {
					log(`[${i}/${total}] Upserting records for ${record.organization.create.name}`, 'info')
					const counts = {
						emails: 0,
						phones: 0,
						services: 0,
						locations: 0,
						organizations: 0,
					}
					const org = await tx.organization.upsert(record.organization)
					if (org) counts.organizations++
					for (const email of record.orgEmail) {
						log(`Upserting email ${email.create.email}`, 'update', true)
						const result = await tx.orgEmail.upsert(email)
						if (result) counts.emails++
					}
					for (const phone of record.orgPhone) {
						log(`Upserting phone ${phone.create.number}`, 'update', true)
						const result = await tx.orgPhone.upsert(phone)
						if (result) counts.phones++
					}
					for (const service of record.orgService) {
						log(
							`Upserting service ${service.create.serviceName?.create?.tsKey?.create?.text}`,
							'update',
							true
						)
						const result = await tx.orgService.upsert(service)
						if (result) counts.services++
					}
					for (const location of record.orgLocation) {
						log(`Upserting location ${location.create.name}`, 'update', true)
						const result = await tx.orgLocation.upsert(location)
						if (result) counts.locations++
					}
					log(
						`Processed -> Organizations: ${counts.organizations} Emails: ${counts.emails}/${record.orgEmail.length} Phones: ${counts.phones}/${record.orgPhone.length} Services: ${counts.services}/${record.orgService.length} Locations: ${counts.locations}/${record.orgLocation.length}`,
						'info',
						true
					)
					i++
				}
			},
			{ timeout: 600_000 }
		)

		const handledSuggestions = await prisma.suggestion.updateMany(data.handledSuggestions)
		log(`Marked ${handledSuggestions.count} suggestions as 'handled'`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
