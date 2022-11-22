import { Prisma } from '@prisma/client'
import ISO6391 from 'iso-google-locales'

import { connectUser } from './01-user'

const activeTranslations = ['en', 'en-US', 'en-CA', 'es', 'es-MX', 'es-US']

const languages = ISO6391.getAllCodes()

// en is already created during the initial user seed
export const seedLanguageData: Prisma.LanguageUpsertArgs[] = languages.map((lang) => {
	const localeCode = lang
	const languageName = ISO6391.getName(lang)
	const nativeName = ISO6391.getNativeName(lang)
	const activelyTranslated = activeTranslations.includes(lang)
	return {
		where: {
			localeCode,
		},
		create: {
			localeCode,
			languageName,
			nativeName,
			activelyTranslated,
			createdBy: connectUser,
			updatedBy: connectUser,
		},
		update: {
			languageName,
			nativeName,
			activelyTranslated,
			updatedBy: connectUser,
		},
	}
})
