export const namespaces = [
	'attribute',
	'common',
	'country',
	'gov-dist',
	'org-data',
	'phone-type',
	'services',
	'user',
	'user-title',
] as const

export type Namespaces = (typeof namespaces)[number]

export const namespace = {
	attribute: 'attribute',
	common: 'common',
	country: 'country',
	govDist: 'gov-dist',
	orgData: 'org-data',
	phoneType: 'phone-type',
	services: 'services',
	user: 'user',
	userTitle: 'user-title',
} as const

export type Namespace = typeof namespace
