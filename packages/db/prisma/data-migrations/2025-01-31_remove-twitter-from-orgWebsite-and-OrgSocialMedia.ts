import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2025-02-01_update-org-socialmedia-website-published',
	title: 'Set published to false for Twitter/X URLs in OrgSocialMedia and OrgWebsite',
	createdBy: 'Diana Garbarino',
	description:
		'Find all orgs with URLs starting with http(s)://twitter.com/ or http(s)://x.com/ and set published to false.',
}

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20250201_update_org_socialmedia_website_published = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		// Define conditions for both http and https URLs
		const urlConditions = [
			{ url: { startsWith: 'https://twitter.com/' } },
			{ url: { startsWith: 'http://twitter.com/' } },
			{ url: { startsWith: 'https://x.com/' } },
			{ url: { startsWith: 'http://x.com/' } },
		]

		// Update OrgSocialMedia table
		const socialMediaUpdate = await prisma.orgSocialMedia.updateMany({
			where: { OR: urlConditions },
			data: { published: false },
		})

		// Update OrgWebsite table
		const websiteUpdate = await prisma.orgWebsite.updateMany({
			where: { OR: urlConditions },
			data: { published: false },
		})

		log(`Updated ${socialMediaUpdate.count} records in OrgSocialMedia to set published = false.`)
		log(`Updated ${websiteUpdate.count} records in OrgWebsite to set published = false.`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
