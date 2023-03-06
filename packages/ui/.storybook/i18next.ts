import { locales } from '@weareinreach/api/generated/languages'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi, { HttpBackendOptions } from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import config from '../next-i18next.config'

const ns = [
	'attribute',
	'common',
	// 'country',
	// 'footer',
	// 'gov-dist',
	// 'nav',
	// 'org-description',
	// 'orv-service',
	'phone-type',
	'services',
	'socialMedia',
	'user',
]

i18n
	.use(LanguageDetector)
	.use(HttpApi)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		...config,
		debug: true,
		lng: 'en',
		backend: {
			// loadPath: '/public/locales/{{lng}}/{{ns}}.json',
			loadPath: 'https://inreach-locale.s3.amazonaws.com/dev/{{ns}}+({{lng}}).json',

			requestOptions: {
				mode: 'cors',
			},
		},
		fallbackLng: {
			'en-US': ['en'],
			'es-US': ['es'],
		},
		defaultNS: 'common',
		interpolation: { escapeValue: true, skipOnVariables: false },
		react: { useSuspense: true },
		cleanCode: true,
		supportedLngs: locales,
		ns,
		// resources,
	})

export { i18n }
