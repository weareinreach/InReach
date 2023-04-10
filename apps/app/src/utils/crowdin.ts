/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import Crowdin from '@crowdin/crowdin-api-client'
import OtaClient from '@crowdin/ota-client'

import { crowdinOpts } from '~app/data/crowdinOta'

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
	return await crowdinOta.getFileTranslations(file)
}

export const fetchCrowdinDbKey = async (ns: string, file: string, lang: string) => ({
	[ns]: await crowdinOta.getStringByKey(ns, lang),
})

export const crowdinDistTimestamp = async () => await crowdinOta.getManifestTimestamp()

if (process.env.NODE_ENV !== 'production') {
	global.crowdinApi = crowdinApi
	global.crowdinOta = crowdinOta
}
declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var crowdinApi: Crowdin | undefined
	var crowdinOta: OtaClient | undefined
}
