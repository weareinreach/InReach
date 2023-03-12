import { prisma } from '@weareinreach/db'
import { type User } from 'next-auth'

export const generateUserSession = async (email: string /*id: string*/): Promise<User> => {
	const userRecord = await prisma.user.findUniqueOrThrow({
		where: { email },
		// where: { id },
		select: {
			id: true,
			email: true,
			name: true,
			image: true,
			roles: {
				select: {
					role: {
						select: {
							name: true,
							permissions: {
								select: {
									permission: { select: { name: true } },
								},
							},
						},
					},
				},
			},
			permissions: {
				select: {
					permission: {
						select: { name: true },
					},
				},
			},
		},
	})

	const roleSet = new Set(userRecord.roles.map(({ role }) => role.name))
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
