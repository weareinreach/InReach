export const userTypes = [
	'dataAdmin',
	'dataManager',
	'lcr',
	'provider',
	'seeker',
	'sysadmin',
	'system',
] as const

export const userTypesWithId = [
	{ id: 'utyp_0000000000JGRQ4HEQV2QQNT34', type: 'dataAdmin' },
	{ id: 'utyp_0000000000WGPZEMFBC23R1EEA', type: 'dataManager' },
	{ id: 'utyp_0000000000JZQ2FTJB14BTZPKM', type: 'lcr' },
	{ id: 'utyp_00000000009302JGV6Z0ZTN85S', type: 'provider' },
	{ id: 'utyp_0000000000J3RW733EJ7A8TYT2', type: 'seeker' },
	{ id: 'utyp_0000000000EEG4295WWVCR0CHA', type: 'sysadmin' },
	{ id: 'utyp_0000000000DVTQATX3C0Y0WA65', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
