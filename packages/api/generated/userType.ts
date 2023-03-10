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
	{ id: 'utyp_0000000000P51PM2JQKGYVR687', type: 'seeker' },
	{ id: 'utyp_0000000000V0W7GDTPE8ZC31J5', type: 'provider' },
	{ id: 'utyp_00000000008FZNPA1EJPYCZE6D', type: 'lcr' },
	{ id: 'utyp_0000000000CA1Y6Y8VYSB2410H', type: 'dataManager' },
	{ id: 'utyp_0000000000C2FJZG917XGSCSKT', type: 'dataAdmin' },
	{ id: 'utyp_0000000000H1B2XN664091K1Y7', type: 'sysadmin' },
	{ id: 'utyp_0000000000NG3YANZJ7E665FDZ', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
