import { prisma } from '@weareinreach/db'

import { ListrTask } from '.'
import { writeOutput } from './common'

export const generateServiceCategories = async (task: ListrTask) => {
	const data = await prisma.serviceCategory.findMany({
		where: {
			active: true,
		},
		select: {
			id: true,
			category: true,
			tsKey: true,
			tsNs: true,
		},
	})

	const out = `
	export const serviceCategory = ${JSON.stringify(data)} as const

	\n
	export type ServiceCategory = typeof serviceCategory[number]

	`
	await writeOutput('serviceCategory', out)
	task.title = `${task.title} (${data.length} items)`
}
