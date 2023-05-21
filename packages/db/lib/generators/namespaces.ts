import { prisma } from '~db/client'
import { type ListrTask } from '~db/lib/generateData'

import { writeOutput } from './common'

export const generateNamespaces = async (task: ListrTask) => {
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

	`
	await writeOutput('namespaces', out)
	task.title = `${task.title} (${data.length} items)`
}
