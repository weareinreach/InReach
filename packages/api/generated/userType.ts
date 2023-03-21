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
	{ id: 'utyp_00000000003SNRSANX2B7P3CR4', type: 'seeker' },
	{ id: 'utyp_0000000000GHPG5FCC4FYKGHN3', type: 'provider' },
	{ id: 'utyp_0000000000KHCVJ0KPYRV8Z9YQ', type: 'lcr' },
	{ id: 'utyp_0000000000W72GYEV24MD2YH71', type: 'dataManager' },
	{ id: 'utyp_0000000000PDGMZNV6K4HDCSD6', type: 'dataAdmin' },
	{ id: 'utyp_0000000000ZK5FEMMTTNH38BBC', type: 'sysadmin' },
	{ id: 'utyp_0000000000WJG02YV9DT7BRQ4M', type: 'system' },
] as const

export type UserTypeTags = (typeof userTypes)[number]

export type UserTypesWithId = (typeof userTypesWithId)[number]
