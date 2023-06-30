import Crowdin from '@crowdin/crowdin-api-client'

import { prisma } from '~db/index'
import { type ListrJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-29_update-crowdin-keys',
	title: 'Update CrowdIn keys via CrowdIn API',
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
export const job20230629a = {
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

		// Only run when Vercel is doing the production build.

		// eslint-disable-next-line node/no-process-env
		if (process.env.CI !== '1' && process.env.VERCEL_ENV !== 'production') {
			task.output = `IGNORING - only run when Vercel is doing the production build.`
			await jobPostRunner(jobDef)
			return task.skip()
		}
		const crowdin = new Crowdin({
			organization: 'inreach',
			// eslint-disable-next-line node/no-process-env
			token: process.env.CROWDIN_TOKEN as string,
		})

		const data = await prisma.translationKey.findMany({
			where: { ns: 'org-data', crowdinId: { not: null } },
			select: { key: true, crowdinId: true },
		})
		const batchSize = 300
		const totalBatches = Math.ceil(data.length / batchSize)
		let batchCount = 1
		task.output = `${data.length} records will be divided in to ${totalBatches} batches.`

		while (data.length) {
			const batch = data.splice(0, batchSize)
			task.output = `[${batchCount}/${totalBatches}] Batch updating ${batch.length} strings.`

			const txn = await crowdin.sourceStringsApi.stringBatchOperations(
				12,
				batch.map(({ key, crowdinId }) => ({
					op: 'replace',
					path: `/${crowdinId}/identifier`,
					value: key,
				}))
			)
			task.output = `Keys updated: ${txn.data.length}`

			batchCount++
		}

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
