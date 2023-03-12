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
	{ id: 'urle_00000000003R7BSS9MVC1C6Y4G', tag: 'resource-seeker' },
	{ id: 'urle_0000000000KY1B1T0N3MPGS7NF', tag: 'service-provider' },
	{ id: 'urle_000000000057NV51DKC3MEKPM1', tag: 'local-community-reviewer' },
	{ id: 'urle_000000000083VVFN6D9MW7NY3F', tag: 'data-manager' },
	{ id: 'urle_00000000006PWQ4KYVYYGK1DMS', tag: 'data-administrator' },
	{ id: 'urle_0000000000EHEREQADT1M73JT6', tag: 'system-administrator' },
	{ id: 'urle_00000000009DJJ8DTRAHSR0DF6', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
