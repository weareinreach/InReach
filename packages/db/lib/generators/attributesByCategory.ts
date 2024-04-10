import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateAttributesByCategory = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
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
							iconBg: true,
						},
					},
				},
				orderBy: { attribute: { tag: 'asc' } },
			},
		},
		orderBy: { tag: 'asc' },
	})

	const out = `
	export const attributesByCategory = ${JSON.stringify(data)} as const

	\n
	export type AttributesByCategory = typeof attributesByCategory[number]

	`
	await writeOutput('attributesByCategory', out)
	task.title = `${task.title} (${data.length} items)`
}
