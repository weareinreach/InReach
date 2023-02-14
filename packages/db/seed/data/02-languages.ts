import ISO6391 from 'iso-google-locales'
import * as langSupp from 'langs'

import { Prisma } from '~db/client'
import { Log, iconList } from '~db/seed/lib'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

const activeTranslations = ['en', 'en-US', 'en-CA', 'es', 'es-MX', 'es-US']

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
		const nativeName = ISO6391.getNativeName(lang)
		const activelyTranslated = activeTranslations.includes(lang)
		const iso6392 = langSupp.where('1', lang)?.[2]
		const count = i + 1
		const total = languages.length
		log(`(${count}/${total}) Preparing language record for: ${languageName}`)
		return {
			localeCode,
			iso6392,
			languageName,
			nativeName,
			activelyTranslated,
		}
	})
	return data
}
