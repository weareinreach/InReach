import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-19_district-data-corrections',
	title: 'Governing District data corrections',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const PrDataSchema = z.object({ id: z.string(), iso: z.string() }).array()
const MxDataSchema = z.object({ id: z.string(), iso: z.string() }).array()
/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230719a = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
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

		const prData = PrDataSchema.parse(JSON.parse(fs.readFileSync(path.join(__dirname, 'pr.json'), 'utf-8')))
		const mxData = MxDataSchema.parse(JSON.parse(fs.readFileSync(path.join(__dirname, 'mx.json'), 'utf-8')))
		const isoUpdates = await prisma.$transaction(
			[...prData, ...mxData].map(({ id, iso }) => prisma.govDist.update({ where: { id }, data: { iso } }))
		)
		log(`ISO codes updated: ${isoUpdates.length}`)

		const updateName = (id: string, name: string, slug?: string) =>
			prisma.govDist.update({
				where: { id },
				data: { name, slug, key: { update: { text: name, key: slug } } },
			})
		// Do stuff
		const updates = await prisma.$transaction([
			updateName('gdst_01GW2HJA0BE7FF4F7YKAR9VKSG', 'DeWitt', 'us-illinois-dewitt-county'),
			updateName('gdst_01GW2HJFJZPT7RNQMXM7H8HKR8', 'LaRue'),
			updateName('gdst_01GW2HJGHGYD74339CP83XHKTG', 'DeSoto', 'us-louisiana-desoto-county'),
			updateName('gdst_01GW2HJ01XRKWVBQTGFZQW33VB', 'Kusilvak', 'us-alaska-kusilvak-county'),
			updateName('gdst_01GW2HK2DX86W6Y6HZ8ZDRAXJV', 'LeFlore', 'us-oklahoma-leflore-county'),
			updateName('gdst_01GW2HJV6SWRQMJ0H36AAEPTM1', 'Coös'),
			updateName('gdst_01GW2HK67J9DK0JXBK4VK4C4EM', 'Oglala Lakota', 'us-south-dakota-oglala-lakota-county'),
		])
		log(`Names updated: ${updates.length}`)

		const updateMx = await prisma.orgLocation.updateMany({
			where: { govDistId: 'gdst_01GW2HKJ7RG6XAZFVW3KHZEJ5N' },
			data: { govDistId: 'gdst_01GW2HKJ7TH3H6DP8T7X9JD0P7' },
		})
		log(`Mexico locations updated: ${updateMx.count}`)

		const removals = await prisma.govDist.deleteMany({
			where: {
				id: {
					in: [
						'gdst_01GW2HKJ7RG6XAZFVW3KHZEJ5N',
						'gdst_01GW2HKB0KG2G0R852TF709SVM',
						'gdst_01GW2HKB0KMSRD4J9FX440P7D7',
					],
				},
			},
		})
		log(`Districts deleted: ${removals.count}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
