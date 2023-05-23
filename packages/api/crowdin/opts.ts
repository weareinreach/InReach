export const branches = { dev: 32, database: 790, 'database-draft': 792, main: 2187 } as const

export const files = {
	dev: {
		common: 46,
		'gov-dist': 1338,
		'phone-type': 1340,
		country: 1344,
		services: 1348,
		attribute: 1350,
		landingPage: 1352,
		user: 1356,
		suggestOrg: 1450,
		'user-title': 1781,
	},
	database: { 'org-data': 794 },
	'database-draft': {},
	main: {
		attribute: 2189,
		common: 2191,
		country: 2193,
		'gov-dist': 2195,
		landingPage: 2197,
		'phone-type': 2199,
		services: 2201,
		suggestOrg: 2203,
		'user-title': 2205,
		user: 2207,
	},
} as const
