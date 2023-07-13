import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-12_2-leader-focus-attribs',
	title: 'Add leader/focus attributes',
	createdBy: 'Joe Karow',
}

const Schema = z
	.object({
		legacyId: z.string(),
		'bipoc-led': z.boolean().nullish(),
		'black-led': z.boolean().nullish(),
		'bipoc-comm': z.boolean().nullish(),
		'immigrant-led': z.boolean().nullish(),
		'immigrant-comm': z.boolean().nullish(),
		'asylum-seekers': z.boolean().nullish(),
		'resettled-refugees': z.boolean().nullish(),
		'trans-led': z.boolean().nullish(),
		'trans-comm': z.boolean().nullish(),
		'trans-youth-focus': z.boolean().nullish(),
		'trans-masc': z.boolean().nullish(),
		'trans-fem': z.boolean().nullish(),
		'gender-nc': z.boolean().nullish(),
		'lgbtq-youth-focus': z.boolean().nullish(),
		'spanish-speakers': z.boolean().nullish(),
		'hiv-comm': z.boolean().nullish(),
	})
	.array()

/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230712b = {
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
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		const attributes = await prisma.attribute.findMany({
			select: { tag: true, id: true },
		})
		const attributeMap = new Map(attributes.map(({ tag, id }) => [tag, id]))

		const legacyIds = await prisma.organization.findMany({ select: { id: true, legacyId: true } })
		const idMap = new Map(legacyIds.map(({ id, legacyId }) => [legacyId, id]))

		const data = Schema.parse(JSON.parse(fs.readFileSync(path.resolve(__dirname, './data.json'), 'utf-8')))

		const batch: Prisma.OrganizationAttributeCreateManyInput[] = []
		const exceptions: typeof data = []

		log(`Preparing batch from ${data.length} spreadsheet rows.`)
		for (const item of data) {
			const { legacyId, ...tags } = item
			const id = idMap.get(legacyId)
			if (!id) {
				exceptions.push(item)
				continue
			}

			for (const [tag, value] of Object.entries(tags)) {
				const attributeId = attributeMap.get(tag)
				if (attributeId && value) {
					batch.push({ attributeId, organizationId: id })
				}
			}
		}

		log(`Preparation complete. Records to submit: ${batch.length}. Exceptions: ${exceptions.length}.`)

		const result = await prisma.organizationAttribute.createMany({ data: batch, skipDuplicates: true })

		log(
			`Records successfully created: ${result.count}. Skipped due to potential duplication: ${
				batch.length - result.count
			}`
		)

		if (exceptions.length) {
			const exceptionsFile = path.resolve(__dirname, './!exceptions.json')
			fs.writeFileSync(exceptionsFile, JSON.stringify(exceptions))
			log(`${exceptions.length} exceptions written to ${exceptionsFile}`)
		}

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
