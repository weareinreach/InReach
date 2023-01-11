import { Prisma } from '~/client'

export const permissionData: Prisma.PermissionCreateManyInput[] = [
	{
		name: 'editSingleOrg',
		description: 'Edit a single organization',
	},
]
