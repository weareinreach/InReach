import type OtaClient from '@crowdin/ota-client'

export const createCommonFns = (client: OtaClient) => ({
	fetchCrowdinFile: async (file: string, lang: string) => {
		client.setCurrentLocale(lang)
		return client.getFileTranslations(file)
	},
	fetchCrowdinDbKey: async (ns: string, file: string, lang: string) => ({
		[ns]: await client.getStringByKey(ns, lang),
	}),
	crowdinDistTimestamp: async () => client.getManifestTimestamp(),
})
