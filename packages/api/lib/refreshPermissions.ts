/* eslint-disable import/no-unused-modules */
import { prisma } from '@weareinreach/db'
import prettier from 'prettier'

import { writeFileSync } from 'fs'
import path from 'path'

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

	const filename = `${path.resolve(__dirname, '../')}/permissions.ts`

	const prettierOpts = (await prettier.resolveConfig(__dirname)) ?? undefined

	writeFileSync(filename, prettier.format(out, { ...prettierOpts, parser: 'typescript' }))
}

refreshPermissions()
