export const otaHash = 'e-39328dacf5f98928e8273b35wj'
export const otaManifest = `https://distributions.crowdin.net/${otaHash}/manifest.json`
export const projectId = 12

// TODO: [IN-924] Create generator to update Crowdin data on build

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

export const branches = {
	main: 3539,
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
		attribute: 3543,
		common: 3541,
		country: 3545,
		'gov-dist': 3547,
		landingPage: 3549,
		'phone-type': 3551,
		services: 3553,
		suggestOrg: 3555,
		'user-title': 3557,
		user: 3559,
	},
} as const

export const cacheTime = 86400
