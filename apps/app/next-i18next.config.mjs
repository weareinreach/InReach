/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
// @ts-ignore
// const HttpBackend = require('i18next-http-backend/cjs')
import { I18nextKeysOnDemand } from '@weareinreach/i18next-keys-ondemand'
import axios from 'axios'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import intervalPlural from 'i18next-intervalplural-postprocessor'
import LocalStorageBackend from 'i18next-localstorage-backend'
import MultiBackend from 'i18next-multiload-backend-adapter'
import { z } from 'zod'

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

const Keys = z.record(z.string())

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

/** @type {import('@weareinreach/i18next-keys-ondemand').TranslationGetter} */
const onDemandFetcher = async (keys, lang, ns, defaultValues) => {
	console.log('fetcher called', { keys, lang, ns, defaultValues })
	try {
		const { data } = await axios.post(getUrl('/api/i18n/get'), { keys, lang, ns, defaultValues })
		const translations = Keys.parse(data)
		return translations
	} catch (err) {
		console.error(err)
		return {}
	}
}

const onDemand = new I18nextKeysOnDemand({
	translationGetter: onDemandFetcher,
	debounceDelay: 50,
})

// const crowdinBackend = new CrowdinOtaBackend(undefined, )
const apiPath = '/api/i18n/load?lng={{lng}}&ns={{ns}}'
const httpBackend = new HttpBackend(null, {
	loadPath: getUrl(apiPath), //typeof window !== 'undefined' ? apiPath : `http://localhost:3000${apiPath}`,
	allowMultiLoading: true,
})

const multi = new MultiBackend(null, {
	backend: HttpBackend,
	// debounceInterval: 200,
	backendOption: {
		loadPath: getUrl(apiPath), //typeof window !== 'undefined' ? apiPath : `http://localhost:3000${apiPath}`,
		allowMultiLoading: true,
	},
})

/**
 * @template {import('next-i18next').UserConfig} T
 * @type {import('next-i18next').UserConfig}
 * @param {T} config
 * @constraint {{import('next-i18next').UserConfig}}
 */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'fr', 'ar', 'ru'], // ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	defaultNS: 'common',

	fallbackLng: ['en'],
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	debug: process.env.NODE_ENV !== 'production' && isBrowser, //&& !!process.env.NEXT_VERBOSE,
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
			// {
			// 	expirationTime: 60 * 60 * 1000,
			// },
			{
				backend: HttpBackend,
				// debounceInterval: 200,
				backendOption: {
					loadPath: getUrl(apiPath), //isBrowser ? apiPath : `http://localhost:3000${apiPath}`,
					allowMultiLoading: true,
				},
			},
		],
		backends: isBrowser ? [multi] : [], //[LocalStorageBackend, multi] : [],
	},

	// saveMissing: true,

	// updateMissing: true,
	serializeConfig: false,
	use: isBrowser ? [ChainedBackend, intervalPlural] : [intervalPlural],
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
	// postProcess: ['interval'],
}
export default config
