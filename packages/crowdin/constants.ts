import { isVercelProd } from '@weareinreach/env'
import { createLoggerInstance } from '@weareinreach/util/logger'

const logger = createLoggerInstance('📦 Crowdin Client')
const getValue = <T>(production: T, development: T): T => {
	// eslint-disable-next-line node/no-process-env
	if (isVercelProd && !process.env.CROWDIN_SANDBOX) {
		logger.info('Using production environment')
		return production
	}
	logger.info('Using development environment')
	return development
}

export const otaHash = 'e-39328dacf5f98928e8273b35wj'
export const otaManifest = `https://distributions.crowdin.net/${otaHash}/manifest.json`
export const projectId = {
	base: getValue(12, 20),
	dbContent: getValue(22, 22),
}

// TODO: [IN-924] Create generator to update Crowdin data on build

export const sourceFiles = (lang: string) =>
	getValue(
		{
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
		} as const,
		{
			databaseStrings: `/content/${lang}/database/org-data.json`,
			attribute: `/content/main/${lang}/attribute.json`,
			common: `/content/main/${lang}/common.json`,
			country: `/content/main/${lang}/country.json`,
			'gov-dist': `/content/main/${lang}/gov-dist.json`,
			landingPage: `/content/main/${lang}/landingPage.json`,
			'phone-type': `/content/main/${lang}/phone-type.json`,
			services: `/content/main/${lang}/services.json`,
			suggestOrg: `/content/main/${lang}/suggestOrg.json`,
			'user-title': `/content/main/${lang}/user-title.json`,
			user: `/content/main/${lang}/user.json`,
		} as const
	)

export const branches = getValue(
	{
		main: 3539,
		dev: 32,
		database: 790,
		'database-draft': 792,
	} as const,
	{
		main: 5354,
		dev: 5360,
		database: 5408,
		'database-draft': 5408,
	} as const
)
export const fileIds = getValue(
	{
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
	} as const,
	{
		dev: {
			common: 5366,
			'gov-dist': 5362,
			'phone-type': 5372,
			country: 5368,
			services: 5374,
			attribute: 5364,
			landingPage: 5370,
			user: 5380,
			suggestOrg: 5376,
			'user-title': 5378,
		},
		database: { 'org-data': 5346 },
		'database-draft': {},
		main: {
			attribute: 5332,
			common: 5348,
			country: 5336,
			'gov-dist': 5340,
			landingPage: 5322,
			'phone-type': 5338,
			services: 5342,
			suggestOrg: 5324,
			'user-title': 5334,
			user: 5344,
		},
	} as const
)

export const cacheTime = 86400
