/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// @ts-check
import LanguageDetector from 'i18next-browser-languagedetector'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import intervalPlural from 'i18next-intervalplural-postprocessor'
// import LocalStorageBackend from 'i18next-localstorage-backend'
import MultiBackend from 'i18next-multiload-backend-adapter'

import path from 'path'

export const namespaces = [
	'attribute',
	'common',
	'country',
	'gov-dist',
	// 'org-data',
	// 'org-description',
	// 'org-service',
	'phone-type',
	'services',
	'user',
]
const isBrowser = typeof window !== 'undefined'

// const Keys = z.record(z.string())

/**
 * Gets full path based on environment
 *
 * @param {string} path
 * @returns Full URL or relative path
 */
const getUrl = (path) => {
	if (typeof path !== 'string') throw new Error('Path must be a string')
	const parsedPath = path.charAt(0) === '/' ? path : `/${path}`
	if (typeof window !== 'undefined') return parsedPath // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${parsedPath}` // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}${parsedPath}` // dev SSR should use localhost
}

const apiPath = '/api/i18n/load?lng={{lng}}&ns={{ns}}'

const multi = new MultiBackend(null, {
	backend: HttpBackend,
	// debounceInterval: 200,
	backendOption: {
		loadPath: getUrl(apiPath),
		allowMultiLoading: true,
	},
})

/** @type {import('next-i18next').UserConfig} */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'fr', 'ar', 'ru'],
	},
	defaultNS: 'common',
	localePath: path.resolve('./public/locales'),
	fallbackLng: ['en'],
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	debug: process.env.NODE_ENV !== 'production' && isBrowser && !!process.env.NEXT_VERBOSE,
	partialBundledLanguages: true,
	nonExplicitSupportedLngs: true,
	cleanCode: true,
	react: {
		useSuspense: false,
		bindI18nStore: 'added loaded',
		bindI18n: 'languageChanged loaded',
	},

	backend: {
		backendOptions: [
			{
				backend: HttpBackend,
				// debounceInterval: 200,
				backendOption: {
					loadPath: getUrl(apiPath),
					allowMultiLoading: true,
				},
			},
		],
		backends: isBrowser ? [multi] : [],
	},
	serializeConfig: false,
	use: isBrowser ? [ChainedBackend, intervalPlural, LanguageDetector] : [intervalPlural, LanguageDetector],
	maxParallelReads: 20,
	joinArrays: '',
	interpolation: {
		skipOnVariables: false,
		alwaysFormat: true,
		format: (value, format, lng, edit) => {
			switch (format) {
				case 'lowercase': {
					if (typeof value === 'string') return value.toLowerCase()
					break
				}
			}
			return value
		},
	},
}
export default config
