import { prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-05-19_reviews-countries',
	title: 'Flag featured reviews, update countries activeForSuggest',
	createdBy: 'Joe Karow',
}
/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230519 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff
		const activeForSuggestCountries = ['US', 'CA', 'MX']

		const updateCountries = await prisma.country.updateMany({
			where: { cca2: { in: activeForSuggestCountries } },
			data: { activeForSuggest: true },
		})

		task.output = `Countries available for suggestions: ${updateCountries.count}`
		const featuredReviews = [
			'5ea32bac54a2250ad9ea5e57',
			'5ea32bac54a2250ad9ea5e5c',
			'5ea32bac54a2250ad9ea5e68',
			'6338975fb155890016f14df9',
			'6357f8052081da0016ec2709',
			'635885cb2081da0016ec2947',
			'63657b550f2d4e0016355ded',
		]
		const reviewsToDel = [
			'orev_01GVDN0TGVPFN2Y70Q1H7JG1D6',
			'orev_01GVDN0TGM9TCBK2HGFQM676DS',
			'orev_01GVDN0TH6D9MY8M4Z2JY9Y74S',
			'orev_01GVDN0THCCXWZKP468YK80H6W',
			'orev_01GVXX3103NQ28X301ZR0Z2MB3',
		]
		const updateFeaturedReviews = await prisma.orgReview.updateMany({
			where: { legacyId: { in: featuredReviews } },
			data: { featured: true },
		})

		task.output = `Reviews flagged to feature: ${updateFeaturedReviews.count}`

		const removedReviews = await prisma.orgReview.deleteMany({ where: { id: { in: reviewsToDel } } })

		task.output = `Reviews removed: ${removedReviews.count}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
