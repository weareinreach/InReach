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
