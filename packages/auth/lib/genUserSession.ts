import { type User } from 'next-auth'

import { prisma } from '@weareinreach/db'

export const generateUserSession = async (email: string /*id: string*/): Promise<User> => {
	const userRecord = await prisma.user.findUniqueOrThrow({
		where: { email },
		select: {
			id: true,
			email: true,
			name: true,
			image: true,
			roles: {
				select: {
					role: {
						select: {
							tag: true,
							permissions: { select: { permission: { select: { name: true } } } },
						},
					},
				},
			},
			permissions: { select: { permission: { select: { name: true } } } },
		},
	})
	const roleSet = new Set(userRecord.roles.map(({ role }) => role.tag))
	const permissionSet = new Set([
		...userRecord.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.name)),
		...userRecord.permissions.map(({ permission }) => permission.name),
	])
	return {
		...userRecord,
		roles: Array.from(roleSet),
		permissions: Array.from(permissionSet),
	}
}
