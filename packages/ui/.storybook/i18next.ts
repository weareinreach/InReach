import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi, { type HttpBackendOptions } from 'i18next-http-backend'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import { initReactI18next } from 'react-i18next'

import { locales } from '@weareinreach/db/generated/languages'

import config from '../next-i18next.config'

const ns = ['attribute', 'common', 'phone-type', 'services', 'user']

i18n
	.use(intervalPlural)
	.use(LanguageDetector)
	.use(HttpApi)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		...config,
		debug: false,

		// lng: 'en',
		backend: {
			loadPath: '/public/locales/{{lng}}/{{ns}}.json',
			// loadPath: 'https://inreach-locale.s3.amazonaws.com/dev/{{ns}}+({{lng}}).json',

			requestOptions: {
				mode: 'cors',
			},
		},
		fallbackLng: {
			'en-US': ['en'],
			'es-US': ['es'],
		},
		defaultNS: 'common',
		interpolation: {
			escapeValue: true,
			skipOnVariables: false,
			format: (value, format) => {
				switch (format) {
					case 'lowercase': {
						if (typeof value === 'string') return value.toLowerCase()
					}
				}
				return value
			},
		},
		react: { useSuspense: false, bindI18nStore: 'added loaded', bindI18n: 'languageChanged loaded' },
		cleanCode: true,
		supportedLngs: locales,
		ns,
		joinArrays: '',
		// resources,
	})

export { i18n }
