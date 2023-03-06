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
	{ id: 'urle_0000000000KSHT8AJ7DNYZRDB7', tag: 'resource-seeker' },
	{ id: 'urle_0000000000HC4NPK2W1FKPCBHR', tag: 'service-provider' },
	{ id: 'urle_0000000000W1CHFQSMDZSXVCQP', tag: 'local-community-reviewer' },
	{ id: 'urle_0000000000BSGXZ0KQPTKAXDTC', tag: 'data-manager' },
	{ id: 'urle_0000000000SFQMF4XKF0CMF2S5', tag: 'data-administrator' },
	{ id: 'urle_00000000000RYT706Z5R9GXPA7', tag: 'system-administrator' },
	{ id: 'urle_0000000000EBNJTT8V6Y3SGMYA', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
