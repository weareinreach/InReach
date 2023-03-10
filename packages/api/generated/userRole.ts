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
	{ id: 'urle_000000000053NMSYRPBK0499E0', tag: 'resource-seeker' },
	{ id: 'urle_00000000000AVZMJ2HBQGCW1MP', tag: 'service-provider' },
	{ id: 'urle_0000000000NPXPWEWJSFM0BQ5T', tag: 'local-community-reviewer' },
	{ id: 'urle_00000000006C1Q58WWJJFMW855', tag: 'data-manager' },
	{ id: 'urle_0000000000VCA8JCN65XAV461R', tag: 'data-administrator' },
	{ id: 'urle_0000000000JCD4935XQRV4P8G2', tag: 'system-administrator' },
	{ id: 'urle_0000000000C8CXHAF3MS5J1HGJ', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
