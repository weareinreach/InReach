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
	{ id: 'utyp_000000000023DP0VZX2Q986NTD', type: 'seeker' },
	{ id: 'utyp_0000000000A508A58T7HT8XFK7', type: 'provider' },
	{ id: 'utyp_0000000000EJBYWNY4NZE89R6Q', type: 'lcr' },
	{ id: 'utyp_0000000000GH8H79CMHCGAGWX0', type: 'dataManager' },
	{ id: 'utyp_0000000000HM97KKDVZMBKPV8P', type: 'dataAdmin' },
	{ id: 'utyp_000000000042BK08DBTVJR23M8', type: 'sysadmin' },
	{ id: 'utyp_0000000000CHQECXGCWFDBS6T3', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
