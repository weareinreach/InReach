/* eslint-disable no-var */
/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import Crowdin from '@crowdin/crowdin-api-client'
import OtaClient from '@crowdin/ota-client'

export const crowdinOpts = {
	hash: 'e-39328dacf5f98928e8273b35wj',
	nsFileMap: (lang: string) => ({
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
	}),
	redisTTL: 86400,
	// redisUrl: process.env.REDIS_URL,
} as const

export const crowdinApi =
	global.crowdinApi ||
	new Crowdin({
		organization: 'inreach',
		token: process.env.CROWDIN_TOKEN as string,
	})
export const crowdinOta = new OtaClient(crowdinOpts.hash, {
	enterpriseOrganizationDomain: 'inreach',
	disableJsonDeepMerge: true,
})

export const crowdinVars = {
	projectId: 12,
	branch: {
		main: 30,
		dev: 32,
		database: 790,
		'database-draft': 792,
	},
} as const

export const fetchCrowdinFile = async (file: string, lang: string) => {
	crowdinOta.setCurrentLocale(lang)
	return crowdinOta.getFileTranslations(file)
}

export const fetchCrowdinDbKey = async (ns: string, file: string, lang: string) => ({
	[ns]: await crowdinOta.getStringByKey(ns, lang),
})

export const crowdinDistTimestamp = async () => crowdinOta.getManifestTimestamp()

if (process.env.NODE_ENV !== 'production') {
	global.crowdinApi = crowdinApi
	global.crowdinOta = crowdinOta
}
declare global {
	var crowdinApi: Crowdin | undefined
	var crowdinOta: OtaClient | undefined
}
