export const userRoles = [
	'resource-seeker',
	'service-provider',
	'local-community-reviewer',
	'data-manager',
	'data-administrator',
	'system-administrator',
	'system-user',
] as const

export const userRolesWithId = [
	{ id: 'urle_000000000088C9GAE1NR7S3YBF', tag: 'resource-seeker' },
	{ id: 'urle_0000000000Q8JTPXWXKCK450GW', tag: 'service-provider' },
	{ id: 'urle_0000000000FW2DGSC961J8A0VV', tag: 'local-community-reviewer' },
	{ id: 'urle_0000000000TMZTKWF41JSNQG33', tag: 'data-manager' },
	{ id: 'urle_00000000004P9WZGG6WEBVHQZ9', tag: 'data-administrator' },
	{ id: 'urle_0000000000JTBA2NMF19AQ9C6X', tag: 'system-administrator' },
	{ id: 'urle_00000000002AS12M4EDTPXNPEH', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
