export const userRoles = [
	'data-administrator',
	'data-manager',
	'local-community-reviewer',
	'resource-seeker',
	'root',
	'service-provider',
	'system-administrator',
	'system-user',
] as const

export const userRolesWithId = [
	{ id: 'urle_00000000008SXEBASAJSP8FF3J', tag: 'data-administrator' },
	{ id: 'urle_0000000000QMC46ZPPVGGFE2TP', tag: 'data-manager' },
	{ id: 'urle_0000000000Q0HXPSCR8MVAH0M2', tag: 'local-community-reviewer' },
	{ id: 'urle_0000000000TP76DC8VXBJ087RC', tag: 'resource-seeker' },
	{ id: 'urle_01GXVAVJHNARFQ1T0MZHTG5XQE', tag: 'root' },
	{ id: 'urle_0000000000J8KFP0GT0GRANV6V', tag: 'service-provider' },
	{ id: 'urle_00000000001D02PYCYKHT029HR', tag: 'system-administrator' },
	{ id: 'urle_0000000000568E6GHB0ETGKNYG', tag: 'system-user' },
] as const

export type UserRoleTags = (typeof userRoles)[number]

export type UserRolesWithId = (typeof userRolesWithId)[number]
