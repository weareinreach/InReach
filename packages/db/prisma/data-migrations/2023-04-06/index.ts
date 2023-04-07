import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, Prisma } from '~db/index'
import { batchRunner } from '~db/prisma/batchRunner'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-04-06-attributes',
	title: 'Misc attribute updates',
	createdBy: 'Joe Karow',
}

const isSuccess = (criteria: unknown) => (criteria ? '✅' : '❎')

const CostDescSchema = z
	.object({
		id: z.string(),
		data: z.string(),
		slug: z.string(),
	})
	.array()

const job: ListrTask = async (_ctx, task) => {
	/** Do not edit this part - this ensures that jobs are only run once */
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	const updateDesc = await prisma.attribute.update({
		where: {
			tag: 'other-describe',
		},
		data: {
			intDesc: 'Used for "Target Population" in Service modal',
		},
	})
	task.output = `${isSuccess(updateDesc)} Update description for "eligibility.other-describe"`

	const costIcons = await prisma.attribute.updateMany({
		where: { tag: { in: ['cost-free', 'cost-fees'] } },
		data: {
			icon: 'carbon:piggy-bank',
		},
	})
	task.output = `${isSuccess(costIcons.count)} Update icons for "cost" attributes (${costIcons.count})`

	const costDescRaw = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'costDesc.json'), 'utf-8'))
	const parsedCostDesc = CostDescSchema.parse(costDescRaw)
	const costDescUpdates = parsedCostDesc.map(({ data: text, id, slug }) => {
		const key = `${slug}.attribute.${id}`
		const ns = 'org-data'
		return prisma.attributeSupplement.update({
			where: { id },
			data: {
				text: {
					upsert: {
						create: { tsKey: { create: { key, text, ns } } },
						update: { tsKey: { update: { text } } },
					},
				},
				data: Prisma.JsonNull,
			},
		})
	})

	task.output = `Generated batch for Cost supplement updates: ${costDescUpdates.length} records`
	task.output = `Running batches...`
	const costDescResult = await batchRunner(costDescUpdates, task)

	task.output = `Cost attribute supplement records updated: ${costDescResult}`
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
export const job20230406 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
