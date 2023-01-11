import { Prisma } from '~/client'

export const permissionData: Prisma.PermissionCreateManyInput[] = [
	{
		name: 'editSingleOrg',
		description: 'Edit a single organization',
	},
	{
		name: 'basic',
		description: 'Basic user role',
	},
	{
		name: 'deleteUserReview',
		description: "Delete a user's review",
	},
	{
		name: 'hideUserReview',
		description: "Hide a user's review",
	},
	{
		name: 'showUserReview',
		description: "Show a user's review",
	},
]
