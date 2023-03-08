export const translatedLangs = [
	{ nativeName: 'اللغة العربية', localeCode: 'ar', languageName: 'Arabic' },
	{ nativeName: 'English', localeCode: 'en', languageName: 'English' },
	{ nativeName: 'español', localeCode: 'es', languageName: 'Spanish' },
	{ nativeName: 'français', localeCode: 'fr', languageName: 'French' },
	{ nativeName: 'Русский', localeCode: 'ru', languageName: 'Russian' },
] as const
export const locales = ['ar', 'en', 'es', 'fr', 'ru'] as const

export type TranslatedLangs = typeof translatedLangs
export type LocaleCodes = (typeof locales)[number]
