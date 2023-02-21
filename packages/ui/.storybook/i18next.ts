import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi, { HttpBackendOptions } from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import config from '../next-i18next.config'

const ns = ['common', 'country', 'user', 'footer', 'nav', 'socialMedia', 'attribute']
export const i18nLocales = {
	en: 'English',
	// 'en-US': 'English (US)',
	// 'en-CA': 'English (CA)',
	// 'en-MX': 'English (MX)',
	// es: 'Spanish',
	// 'es-US': 'Spanish (US)',
	// 'es-MX': 'Spanish (MX)',
}

export const customLocales = {
	name: 'Locale',
	description: 'Internationalization locale',
	defaultValue: 'en',
	toolbar: {
		icon: 'globe',
		items: [
			{ value: 'en', right: '🇺🇸', title: 'English' },
			// { value: 'fr', right: '🇫🇷', title: 'Français' },
			{ value: 'es', right: '🇪🇸', title: 'Español' },
			// { value: 'zh', right: '🇨🇳', title: '中文' },
			// { value: 'kr', right: '🇰🇷', title: '한국어' },
		],
	},
} as const

export type CustomLocales = typeof supportedLngs

const supportedLngs = customLocales.toolbar.items.map((lang) => lang.value)

// const resources = ns.reduce((acc: Record<string, Record<string, string>>, n) => {
// 	supportedLngs.forEach((lng) => {
// 		if (!acc[lng]) acc[lng] = {}
// 		acc[lng] = {
// 			...acc[lng],
// 			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// 			[n]: require(`../../../apps/app/public/locales/${lng}/${n}.json`),
// 		}
// 	})
// 	return acc
// }, {})

i18n
	.use(LanguageDetector)
	.use(HttpApi)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		...config,
		debug: true,
		lng: 'en',
		backend: {
			loadPath: '/public/locales/{{lng}}/{{ns}}.json',
		},
		fallbackLng: {
			'en-US': ['en'],
			'es-US': ['es'],
		},
		defaultNS: 'common',
		interpolation: { escapeValue: false },
		react: { useSuspense: true },
		cleanCode: true,
		supportedLngs,
		ns,
		// resources,
	})

export { i18n }
