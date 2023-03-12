import { prisma } from '@weareinreach/db'

import { ListrTask } from '.'
import { writeOutput } from './common'

export const generateAttributesByCategory = async (task: ListrTask) => {
	const data = await prisma.attributeCategory.findMany({
		where: { active: true },
		select: {
			id: true,
			tag: true,
			icon: true,
			ns: true,
			attributes: {
				where: {
					attribute: {
						active: true,
					},
				},
				select: {
					attribute: {
						select: {
							id: true,
							icon: true,
							tag: true,
							tsKey: true,
							tsNs: true,
							showOnLocation: true,
							filterType: true,
						},
					},
				},
			},
		},
	})

	const out = `
	export const attributesByCategory = ${JSON.stringify(data)} as const

	\n
	export type AtttributesByCategory = typeof attributesByCategory[number]

	`
	await writeOutput('attributesByCategory', out)
	task.title = `${task.title} (${data.length} items)`
}
