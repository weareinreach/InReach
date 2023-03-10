import ISO6391 from 'iso-google-locales'
import capitalize from 'just-capitalize'
import * as langSupp from 'langs'

import { Prisma, generateId } from '~db/.'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

const activeTranslations = ['en', 'es', 'fr', 'ar', 'ru']

const languages = ISO6391.getAllCodes()

// en is already created during the initial user seed
export const genSeedLanguageData = (task: ListrTask) => {
	const log: Log = (message, icon?) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${dispIcon}${message}`
		logFile.info(formattedMessage)
		task.output = formattedMessage
	}

	const data: Prisma.LanguageCreateManyInput[] = languages.map((lang, i) => {
		const localeCode = lang
		const languageName = ISO6391.getName(lang)
		const nativeName = capitalize(ISO6391.getNativeName(lang))
		const activelyTranslated = activeTranslations.includes(lang)
		const iso6392 = langSupp.where('1', lang)?.[2]
		const count = i + 1
		const total = languages.length
		log(`(${count}/${total}) Preparing language record for: ${languageName}`)
		return {
			id: generateId('language', 0),
			localeCode,
			iso6392,
			languageName,
			nativeName,
			activelyTranslated,
		}
	})
	return data
}
