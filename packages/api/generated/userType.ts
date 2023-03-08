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
	{ id: 'utyp_00000000008XS7VB7W3GWCNZDA', type: 'seeker' },
	{ id: 'utyp_0000000000JFBZ38PZYF60XYPQ', type: 'provider' },
	{ id: 'utyp_00000000009M0WY6JD5HZRHCYX', type: 'lcr' },
	{ id: 'utyp_00000000007N2K4S9KSM21Q5J2', type: 'dataManager' },
	{ id: 'utyp_0000000000MGQHAWJP8Z481TEM', type: 'dataAdmin' },
	{ id: 'utyp_00000000004B5DRNJ84TYWV5B7', type: 'sysadmin' },
	{ id: 'utyp_0000000000DPCMEBJD7YJM2KVP', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
