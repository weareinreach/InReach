import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateServiceCategories = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
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
		orderBy: { category: 'asc' },
	})

	const out = `
	export const serviceCategory = ${JSON.stringify(data)} as const

	\n
	export type ServiceCategory = typeof serviceCategory[number]

	`
	await writeOutput('serviceCategory', out)
	task.title = `${task.title} (${data.length} items)`
}
