import { type Context, type ListrTask } from '~db/lib/generateData'

const camelize = (s: string) => s.replace(/-./g, (x) => x[1]!.toUpperCase())

export const generateNamespaces = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
	const data = await prisma.translationNamespace.findMany({
		select: {
			name: true,
		},
		orderBy: { name: 'asc' },
	})

	const out = `
	export const namespaces = ${JSON.stringify(data.map(({ name }) => name))} as const

	\n
	export type Namespaces = typeof namespaces[number]
	\n
	export const namespace = ${JSON.stringify(
		Object.fromEntries(data.map(({ name }) => [camelize(name), name]))
	)} as const
	\n
	export type Namespace = typeof namespace
	`
	await writeOutput('namespaces', out)
	task.title = `${task.title} (${data.length} items)`
}
