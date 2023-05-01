import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { batchRunner } from '~db/prisma/batchRunner'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-26-attribute-data',
	title: 'Attribute updates',
	createdBy: 'Joe Karow',
}
const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')

const Schema = z
	.object({
		key: z.string(),
		ns: z.string(),
		interpolation: z.literal('PLURAL'),
		interpolationValues: z.string().transform((data) => JSON.parse(data)),
	})
	.array()

const dataFile = path.resolve(__dirname, 'interpolation.json')

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	/** Start defining your data migration from here. */
	const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
	const interpolationData = Schema.safeParse(rawData)
	if (interpolationData.success) {
		const transactions = interpolationData.data.map(({ key, ns, ...data }) =>
			prisma.translationKey.update({ where: { ns_key: { ns, key } }, data })
		)
		await batchRunner(transactions, task)
	} else throw new Error('JSON parse error', { cause: interpolationData.error })

	const accessibleBoolean = await prisma.attribute.update({
		where: { tag: 'wheelchair-accessible' },
		data: {
			requireBoolean: true,
			key: {
				update: {
					interpolation: 'CONTEXT',
					interpolationValues: { true: 'Accessible', false: 'Not Accessible' },
				},
			},
		},
	})
	task.output = `${isSuccess(accessibleBoolean)} Update 'Accessibility' Tag`

	const ageTag = await prisma.translationKey.update({
		where: { ns_key: { ns: 'attribute', key: 'eligibility.elig-age' } },
		data: {
			interpolation: 'CONTEXT',
			interpolationValues: { min: '{{min}} and older', max: 'Under {{max}}', range: '{{min}} - {{max}}' },
		},
	})
	task.output = `${isSuccess(ageTag)} Update 'Eligible ages' Tag`
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
export const job20230426 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
