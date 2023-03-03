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
	{ id: 'utyp_0000000000WCRHHZHYYVB0XDHN', type: 'seeker' },
	{ id: 'utyp_0000000000KN5XHGMDJVN2KXWV', type: 'provider' },
	{ id: 'utyp_0000000000TJTM1HV814JNB68V', type: 'lcr' },
	{ id: 'utyp_0000000000967F8SGY6DG9P1C4', type: 'dataManager' },
	{ id: 'utyp_0000000000N8J7CCN9JK41W0BW', type: 'dataAdmin' },
	{ id: 'utyp_0000000000973TS42B5K9CKGWW', type: 'sysadmin' },
	{ id: 'utyp_000000000011WW9HJJ23FS2S1J', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
