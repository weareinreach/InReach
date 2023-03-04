import { prisma } from '@weareinreach/db'

import { ListrTask } from '.'
import { writeOutput } from './common'

export const generateLanguages = async (task: ListrTask) => {
	const languages = await prisma.language.findMany({
		where: {
			activelyTranslated: true,
		},
		select: {
			nativeName: true,
			localeCode: true,
			languageName: true,
		},
	})
	const locales = languages.map((lang) => lang.localeCode)

	const baseOutput = `export const translatedLangs = ${JSON.stringify(languages)}`
	const localeOutput = `export const locales = ${JSON.stringify(locales)}`
	const javascriptOutput = `/** @type {${JSON.stringify(locales)}} */ \n${localeOutput}`
	const asConst = (str: string) => `${str} as const`
	const typescriptOutput = `${asConst(baseOutput)} \n ${asConst(localeOutput)}\n
	export type TranslatedLangs = typeof translatedLangs
	export type LocaleCodes = typeof locales[number]`

	await writeOutput('languages', typescriptOutput)
	await writeOutput('locales', javascriptOutput, true)

	task.title = `${task.title} (${languages.length} items)`
}
