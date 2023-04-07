import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

const jobDef: JobDef = {
	jobId: '2023-04-04-data-load',
	title: 'Load partial data for focus/leader badges',
	createdBy: 'Joe Karow',
}

const DataSchema = z
	.object({
		Sheet1: z
			.object({
				legacyId: z.string(),
				name: z.string(),
				'bipoc-led': z.boolean(),
				'black-led': z.boolean(),
				'bipoc-comm': z.boolean(),
				'immigrant-led': z.boolean(),
				'immigrant-comm': z.boolean(),
				'asylum-seekers': z.boolean(),
				'resettled-refugees': z.boolean(),
				'trans-led': z.boolean(),
				'trans-comm': z.boolean(),
				'trans-youth-focus': z.boolean(),
				'trans-masc': z.boolean(),
				'trans-fem': z.boolean(),
				'gender-nc': z.boolean(),
				'lgbtq-youth-focus': z.boolean(),
				'spanish-speakers': z.boolean(),
				'hiv-comm': z.boolean(),
			})
			.array(),
	})
	.transform(({ Sheet1 }) => Sheet1)

type Data = z.infer<typeof DataSchema>
type DataRecord = Data[number]

const job: ListrTask = async (_ctx, task) => {
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8'))
	const parsedData = DataSchema.parse(rawData)

	const attributeIds = await prisma.attribute.findMany({ select: { id: true, tag: true } })
	const attributeMap = new Map(attributeIds.map(({ id, tag }) => [tag, id]))
	const organizationIds = await prisma.organization.findMany({ select: { id: true, legacyId: true } })
	const orgMap = new Map(organizationIds.map(({ id, legacyId }) => [legacyId, id]))

	const transactions: Prisma.OrganizationAttributeCreateManyInput[] = []
	const rejected: (DataRecord & { reason: string })[] = []
	for (const record of parsedData) {
		const tags: string[] = []
		let count = 0
		const organizationId = orgMap.get(record.legacyId)
		if (!organizationId) {
			rejected.push({ ...record, reason: 'cannot find orgId' })
			continue
		}
		Object.entries(record).forEach(([key, value]) => (value === true ? tags.push(key) : undefined))
		tags.forEach((tag) => {
			const attributeId = attributeMap.get(tag)
			if (!attributeId) {
				rejected.push({ ...record, reason: `Cannot find attributeId for: ${tag}` })
				return
			}
			transactions.push({ organizationId, attributeId })
			count++
		})
		task.output = `${record.name}: ${count} records`
	}

	if (rejected.length) {
		fs.writeFileSync(path.resolve(__dirname, 'rejected.json'), JSON.stringify(rejected))
	}

	const result = await prisma.organizationAttribute.createMany({
		data: transactions,
		skipDuplicates: true,
	})

	task.output = `Organization Attribute records created: ${result.count}`
}

export const job20220404 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
