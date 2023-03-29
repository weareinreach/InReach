import flush from 'just-flush'

import { prisma, Prisma } from '~db/index'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

const jobDef: JobDef = {
	jobId: '2023-03-29-attribNest',
	title: 'Mark primary countries, nest attributes',
	createdBy: 'Joe Karow',
}

const nestServices = [
	{
		parent: 'srvfocus.immigrant-comm',
		child: 'srvfocus.asylum-seekers',
	},
	{
		parent: 'srvfocus.immigrant-comm',
		child: 'srvfocus.resettled-refugees',
	},
	{
		parent: 'srvfocus.lgbtq-youth-focus',
		child: 'srvfocus.trans-youth-focus',
	},
]

const job: ListrTask = async (_ctx, task) => {
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}

	const countryUpdate = await prisma.country.updateMany({
		where: { cca2: { in: ['US', 'CA', 'MX'] } },
		data: { activeForOrgs: true },
	})
	const attributes = await prisma.attribute.findMany({
		where: { active: true, tsKey: { startsWith: 'srvfocus' } },
		select: { id: true, tsKey: true },
	})
	const nestLinkData: Prisma.AttributeNestingCreateManyInput[] = []
	for (const item of nestServices) {
		const parentId = attributes.find(({ tsKey }) => item.parent === tsKey)?.id
		const childId = attributes.find(({ tsKey }) => item.child === tsKey)?.id
		if (parentId && childId) nestLinkData.push({ childId, parentId })
	}

	const nestUpdate = await prisma.attributeNesting.createMany({ data: nestLinkData, skipDuplicates: true })

	const transChildren = [
		'srvfocus.gender-nc',
		'srvfocus.trans-masc',
		'srvfocus.trans-fem',
		'srvfocus.trans-youth-focus',
	]
	const { id: srvFocusCat } = await prisma.attributeCategory.findUniqueOrThrow({
		where: { tag: 'service-focus' },
	})

	const createTransParent = await prisma.attribute.upsert({
		where: {
			tag: 'transgender-comm',
		},
		create: {
			tag: 'transgender-comm',
			name: 'Transgender community',
			icon: '🏳️‍⚧️',
			categories: {
				createMany: {
					data: [{ categoryId: srvFocusCat }],
					skipDuplicates: true,
				},
			},
			key: {
				connectOrCreate: {
					where: { ns_key: { key: 'srvfocus.transgender', ns: 'attribute' } },
					create: { key: 'srvfocus.transgender', text: 'Transgender community', ns: 'attribute' },
				},
			},
			children: {
				createMany: {
					data: flush(
						transChildren.map((tsKey) => {
							const attrib = attributes.find(({ tsKey: key }) => key === tsKey)
							if (!attrib) return
							return { childId: attrib?.id }
						})
					),
					skipDuplicates: true,
				},
			},
		},
		update: {
			name: 'Transgender community',
			icon: '🏳️‍⚧️',
			categories: {
				createMany: {
					data: [{ categoryId: srvFocusCat }],
					skipDuplicates: true,
				},
			},
			key: {
				connectOrCreate: {
					where: { ns_key: { key: 'srvfocus.transgender', ns: 'attribute' } },
					create: { key: 'srvfocus.transgender', text: 'Transgender community', ns: 'attribute' },
				},
			},
			children: {
				createMany: {
					data: flush(
						transChildren.map((tsKey) => {
							const attrib = attributes.find(({ tsKey: key }) => key === tsKey)
							if (!attrib) return
							return { childId: attrib?.id }
						})
					),
					skipDuplicates: true,
				},
			},
		},
	})

	task.output = `Country updates: ${countryUpdate.count}`
	task.output = `Attributes nested: ${nestUpdate.count}`
	task.output = `Attribute parent created: ${createTransParent.id}`
}

export const job20220329 = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
