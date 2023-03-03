/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import Crowdin, { type StringTranslationsModel } from '@crowdin/crowdin-api-client'

export const crowdin = new Crowdin({
	organization: 'inreach',
	token: process.env.CROWDIN_TOKEN as string,
})

export const crowdinProjId = 12 as const
export const crowdinBranch = {
	main: 30,
	dev: 32,
	database: 790,
	'database-draft': 792,
} as const

const isPlural = (result: CrowdinResponse): result is StringTranslationsModel.PluralLanguageTranslation => {
	return 'plurals' in result
}

export const fetchTranslation = async (branchId: keyof typeof crowdinBranch, lang: string, key: string) => {
	const tMap = new Map<number, string>()
	let tToFetch: number[] = []
	const crowdin = new Crowdin({
		organization: 'inreach',
		token: process.env.CROWDIN_TOKEN as string,
	})
	const stringIds = await crowdin.sourceStringsApi.listProjectStrings(crowdinProjId, {
		branchId: crowdinBranch[branchId],
		filter: key,
		scope: 'identifier',
		limit: 500,
	})
	stringIds.data.forEach((result) => {
		tToFetch.push(result.data.id)
		tMap.set(result.data.id, result.data.identifier)
	})
	if (tToFetch.length) {
		const translations = await crowdin.stringTranslationsApi.listLanguageTranslations(crowdinProjId, lang, {
			stringIds: JSON.stringify(tToFetch),
		})

		const fetched: [string, string][] = []
		translations.data.forEach((result) => {
			const key = tMap.get(result.data.stringId)
			if (!key) return
			if (isPlural(result.data)) {
				result.data.plurals.forEach((plural) => fetched.push([`${key}_${plural.pluralForm}`, plural.text]))
				return
			}
			fetched.push([key, result.data.text])
		})
		const resultObj = Object.fromEntries(new Map(fetched).entries())
		return resultObj
	}
	return undefined
}

type CrowdinResponse =
	| StringTranslationsModel.PlainLanguageTranslation
	| StringTranslationsModel.PluralLanguageTranslation
	| StringTranslationsModel.IcuLanguageTranslation
