import type OtaClient from '@crowdin/ota-client'

export const createCommonFns = ({ common, database }: { common: OtaClient; database: OtaClient }) => ({
	fetchCrowdinFile: async (file: string, lang: string) => {
		common.setCurrentLocale(lang)
		return common.getFileTranslations(file)
	},
	fetchCrowdinDbKey: async (ns: string, lang: string) => ({
		[ns]: await database.getStringByKey(ns, lang),
	}),
	crowdinDistTimestamp: async () => ({
		common: await common.getManifestTimestamp(),
		database: await database.getManifestTimestamp(),
	}),
})
