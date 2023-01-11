export const permissions = [
	'editSingleOrg',
	'basic',
	'deleteUserReview',
	'hideUserReview',
	'showUserReview',
] as const

export type Permission = (typeof permissions)[number]
