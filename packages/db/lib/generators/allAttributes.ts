import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateAllAttributes = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
	const data = await prisma.attribute.findMany({
		select: {
			id: true,
			tag: true,
			name: true,
			icon: true,
			iconBg: true,
			tsNs: true,
			tsKey: true,
			active: true,
			filterType: true,
			showOnLocation: true,
		},
		orderBy: { tag: 'asc' },
	})

	const out = `
	export const allAttributes = ${JSON.stringify(data)} as const

	\n
	export type AllAttributes = typeof allAttributes[number]

	`
	await writeOutput('allAttributes', out)
	task.title = `${task.title} (${data.length} items)`
}
