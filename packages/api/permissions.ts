export const permissions = [
	'editSingleOrg',
	'basic',
	'deleteUserReview',
	'hideUserReview',
	'showUserReview',
	'viewUserReviews',
] as const

export type Permission = (typeof permissions)[number]
