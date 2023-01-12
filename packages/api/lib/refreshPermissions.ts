import { writeFileSync } from 'fs'

import { prisma } from '@weareinreach/db'

const refreshPermissions = async () => {
	const permissions = await prisma.permission.findMany({
		select: {
			name: true,
		},
	})
	const permArray = permissions.map((perm) => perm.name)

	const out = `export const permissions = ${JSON.stringify(
		permArray
	)} as const\n\nexport type Permission = typeof permissions[number]`

	writeFileSync('permissions.ts', out)
}

refreshPermissions()
