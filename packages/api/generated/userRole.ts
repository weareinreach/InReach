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
	{ id: 'urle_0000000000CH93X2VK2KH60MF2', tag: 'resource-seeker' },
	{ id: 'urle_0000000000Q44MVGT3KYRPM7R2', tag: 'service-provider' },
	{ id: 'urle_00000000001BQ88ZD9YQ5W22K9', tag: 'local-community-reviewer' },
	{ id: 'urle_0000000000V246HW0XCJG1321P', tag: 'data-manager' },
	{ id: 'urle_0000000000M26XWGRACKFE1M3C', tag: 'data-administrator' },
	{ id: 'urle_00000000006Q5J82TGS6736WPN', tag: 'system-administrator' },
	{ id: 'urle_00000000003QBSHYHSNXKV6MGV', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
