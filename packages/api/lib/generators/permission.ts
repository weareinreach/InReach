import { prisma } from '@weareinreach/db'

import { ListrTask } from '.'
import { writeOutput } from './common'

export const generatePermissions = async (task: ListrTask) => {
	const permissions = await prisma.permission.findMany({
		select: {
			name: true,
		},
		orderBy: { name: 'asc' },
	})
	const permArray = permissions.map((perm) => perm.name)

	const out = `export const permissions = ${JSON.stringify(
		permArray
	)} as const\n\nexport type Permission = typeof permissions[number]`

	await writeOutput('permission', out)

	task.title = `${task.title} (${permArray.length} items)`
}
