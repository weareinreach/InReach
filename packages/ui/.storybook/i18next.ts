import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

const ns = ['common', 'countries', 'user']
export const i18nLocales = {
	en: 'English',
	'en-US': 'English (US)',
	'en-CA': 'English (CA)',
	'en-MX': 'English (MX)',
	es: 'Spanish',
	'es-US': 'Spanish (US)',
	'es-MX': 'Spanish (MX)',
}
// const supportedLngs = ['en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX']
const supportedLngs = Object.keys(i18nLocales)

// const localePath = (lng: string, n: string) => `../../../apps/app/public/locales/${lng}/${n}.json`
const resources = ns.reduce((acc: Record<string, any>, n) => {
	supportedLngs.forEach((lng) => {
		if (!acc[lng]) acc[lng] = {}
		acc[lng] = {
			...acc[lng],
			[n]: require(`../../../apps/app/public/locales/${lng}/${n}.json`),
		}
	})
	return acc
}, {})

i18n
	.use(LanguageDetector)
	.use(Backend)
	.use(initReactI18next)
	.init({
		debug: true,
		lng: 'en-US',
		fallbackLng: {
			en: ['en-US'],
			es: ['es-US'],
		},
		defaultNS: 'common',
		ns,
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
		supportedLngs,
		resources,
	})

export { i18n }
