import { prisma } from '~db/client'
import { downloadFromDatastore, formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

import { DataSchema } from './!schema'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-11-22_ad-hoc-updates',
	title: 'ad hoc updates',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20231122_ad_hoc_updates = {
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
		const data = DataSchema.parse(await downloadFromDatastore(`migrations/${jobDef.jobId}/data.json`, log))

		const orgUpdates = await prisma.$transaction(
			data.orgUpdate.map((args) => prisma.organization.update(args))
		)
		log(`Orgs submitted: ${data.orgUpdate.length}, updated: ${orgUpdates.length}`)
		const locationUpdates = await prisma.$transaction(
			data.locationUpdate.map((args) => prisma.orgLocation.update(args))
		)
		log(`Locations submitted: ${data.locationUpdate.length}, updated: ${locationUpdates.length}`)
		const websiteUpdates = await prisma.$transaction(
			data.orgWebsiteUpdate.map((args) => prisma.orgWebsite.update(args))
		)
		log(`Websites submitted: ${data.orgWebsiteUpdate.length}, updated: ${websiteUpdates.length}`)

		const unpublishOrgs = await prisma.organization.updateMany(data.unpublish)
		log(`Unpublished orgs: ${unpublishOrgs.count}`)

		const unpublishWeb = await prisma.orgWebsite.updateMany(data.webUnpubOld)
		log(`Unpublished websites: ${unpublishWeb.count}`)

		const webNew = await prisma.orgWebsite.createMany(data.webCreateNew)
		log(`New websites: ${webNew.count}`)

		const newSocial = await prisma.orgSocialMedia.createMany(data.orgSocialMedia)
		log(`New social media: ${newSocial.count}`)

		const newOrgAttrib = await prisma.organizationAttribute.createMany(data.organizationAttribute)
		log(`New org attributes: ${newOrgAttrib.count}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
