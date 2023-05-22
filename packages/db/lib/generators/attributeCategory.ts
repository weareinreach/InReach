import { prisma } from '~db/client'
import { type ListrTask } from '~db/lib/generateData'

import { writeOutput } from './common'

export const generateAttributeCategories = async (task: ListrTask) => {
	const data = await prisma.attributeCategory.findMany({
		where: { active: true },
		select: {
			id: true,
			tag: true,
			icon: true,
			ns: true,
		},
		orderBy: {
			tag: 'asc',
		},
	})

	const out = `
	export const attributeCategory = ${JSON.stringify(data)} as const

	\n
	export type AttributeCategory = typeof attributeCategory[number]

	`
	await writeOutput('attributeCategory', out)
	task.title = `${task.title} (${data.length} items)`
}
