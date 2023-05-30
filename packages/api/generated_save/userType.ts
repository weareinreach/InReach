export const userTypes = [
	'seeker',
	'provider',
	'lcr',
	'dataManager',
	'dataAdmin',
	'sysadmin',
	'system',
] as const

export const userTypesWithId = [
	{ id: 'utyp_0000000000MTFEZPQSMN9TP28M', type: 'seeker' },
	{ id: 'utyp_0000000000352797Y3BRHF3372', type: 'provider' },
	{ id: 'utyp_0000000000RBCZF0R20RYR01BE', type: 'lcr' },
	{ id: 'utyp_000000000000HGFTJD2DP75KDP', type: 'dataManager' },
	{ id: 'utyp_0000000000SVG1Z88XQG9VF0VW', type: 'dataAdmin' },
	{ id: 'utyp_0000000000NZNF3MFTFTJVSHN9', type: 'sysadmin' },
	{ id: 'utyp_0000000000PSMB8YTS36BZS9Y1', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
