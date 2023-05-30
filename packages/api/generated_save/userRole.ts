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
	{ id: 'urle_0000000000GJ11SCT8WDS81MEN', tag: 'resource-seeker' },
	{ id: 'urle_0000000000VNMDZBW0HDD32R1Y', tag: 'service-provider' },
	{ id: 'urle_0000000000WT8T1D145YGQGATY', tag: 'local-community-reviewer' },
	{ id: 'urle_0000000000KWZM4CJVMMSPZP2K', tag: 'data-manager' },
	{ id: 'urle_0000000000DRJ7HYPYV2B1H661', tag: 'data-administrator' },
	{ id: 'urle_0000000000KWXFV891SBB45XTX', tag: 'system-administrator' },
	{ id: 'urle_00000000004481YNAMA109CCRN', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
