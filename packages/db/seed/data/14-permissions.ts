import { Prisma } from '@prisma/client'

export const permissionData: Prisma.PermissionItemCreateManyInput[] = [
	{
		name: 'editSingleOrg',
		description: 'Edit a single organization',
	},
]
