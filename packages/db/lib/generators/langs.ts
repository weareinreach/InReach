import { prisma } from '~db/client'
import { type ListrTask } from '~db/lib/generateData'

import { writeOutput } from './common'

/**
 * List of locales to move to the top of the language lists - will affect locale switcher & language selection
 * combo boxes
 */
// const langsToTop = ['en', 'es', 'fr', 'ar', 'ru', 'zh']

// TODO: [IN-791] Clean up language list - remove duplicates & narrow down to primary langs only
export const generateLanguageFiles = async (task: ListrTask) => {
	const languages = await prisma.language.findMany({
		select: {
			nativeName: true,
			localeCode: true,
			languageName: true,
			activelyTranslated: true,
			groupCommon: true,
		},
		orderBy: [{ defaultSort: 'asc' }, { languageName: 'asc' }],
	})

	// const topLangs = langsToTop.flatMap((locale) => {
	// 	const index = languages.findIndex(({ localeCode }) => localeCode === locale)
	// 	return languages.splice(index, 1)
	// })
	// languages.unshift(...topLangs)
	const langList = languages.map((lang) => ({
		label: lang.languageName,
		value: lang.localeCode,
		description: lang.nativeName,
		common: lang.groupCommon ?? false,
	}))

	const translated = languages.filter(({ activelyTranslated }) => activelyTranslated)
	const translatedLocales = translated.map(({ localeCode }) => localeCode)

	const translatedOutput = `export const translatedLangs = ${JSON.stringify(translated)}`
	const localeOutput = `export const locales = ${JSON.stringify(translatedLocales)}`
	const localeList = `export const localeList = ${JSON.stringify(translatedLocales)}`
	const listOutput = `export const languageList = ${JSON.stringify(langList)}`
	const javascriptOutput = `/** @type {${JSON.stringify(
		translatedLocales
	)}} */ \n${localeOutput}\n\n/** @type {string[]} */ \n${localeList}`
	const asConst = (str: string) => `${str} as const`
	const typescriptOutput = `${asConst(translatedOutput)} \n ${asConst(
		localeOutput
	)}\n ${localeList}\n ${asConst(listOutput)}\n
	export type TranslatedLangs = typeof translatedLangs
	export type LocaleCodes = typeof locales[number]
	export type LanguageList = typeof languageList`

	await writeOutput('languages', typescriptOutput)
	await writeOutput('locales', javascriptOutput, true)

	task.title = `${task.title} (${languages.length} items)`
}
