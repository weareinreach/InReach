export const otaHash = 'e-39328dacf5f98928e8273b35wj'

export const sourceFiles = (lang: string) => ({
	databaseStrings: `/content/${lang}/database/org-data.json`,
	attribute: `/content/main/apps/app/public/locales/${lang}/attribute.json`,
	common: `/content/main/apps/app/public/locales/${lang}/common.json`,
	country: `/content/main/apps/app/public/locales/${lang}/country.json`,
	'gov-dist': `/content/main/apps/app/public/locales/${lang}/gov-dist.json`,
	landingPage: `/content/main/apps/app/public/locales/${lang}/landingPage.json`,
	'phone-type': `/content/main/apps/app/public/locales/${lang}/phone-type.json`,
	services: `/content/main/apps/app/public/locales/${lang}/services.json`,
	suggestOrg: `/content/main/apps/app/public/locales/${lang}/suggestOrg.json`,
	'user-title': `/content/main/apps/app/public/locales/${lang}/user-title.json`,
	user: `/content/main/apps/app/public/locales/${lang}/user.json`,
})
export const projectId = 12
export const branches = {
	main: 30,
	dev: 32,
	database: 790,
	'database-draft': 792,
}
export const fileIds = {
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

export const cacheTime = 86400
