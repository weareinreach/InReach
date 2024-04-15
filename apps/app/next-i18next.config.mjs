/* eslint-disable node/no-process-env */
// @ts-check
import LanguageDetector from 'i18next-browser-languagedetector'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import intervalPlural from 'i18next-intervalplural-postprocessor'
// import LocalStorageBackend from 'i18next-localstorage-backend'
import MultiBackend from 'i18next-multiload-backend-adapter'
import compact from 'just-compact'

import path from 'path'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localeList } from '@weareinreach/db/generated/locales.mjs'

const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV !== 'production' && !process.env.CI
const isVerbose = !!process.env.NEXT_VERBOSE
// const Keys = z.record(z.string())

/**
 * Gets full path based on environment
 *
 * @param {string} path
 * @returns Full URL or relative path
 */
const getUrl = (path) => {
	if (typeof path !== 'string') throw new Error('Path must be a string')
	const parsedPath = path.startsWith('/') ? path : `/${path}`
	if (typeof window !== 'undefined') return parsedPath // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${parsedPath}` // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}${parsedPath}` // dev SSR should use localhost
}

const apiPath = '/api/i18n/load?lng={{lng}}&ns={{ns}}'

const backendConfig = {
	CrowdinOTA: {
		backend: HttpBackend,
		// debounceInterval: 200,
		backendOption: {
			loadPath: getUrl(apiPath),
			allowMultiLoading: true,
		},
	},
	LocalHTTP: {
		backend: HttpBackend,
		backendOption: {
			loadPath: getUrl('/locales/{{lng}}/{{ns}}.json'),
			allowMultiLoading: false,
		},
	},
}

const CrowdinOTA = new MultiBackend(null, backendConfig.CrowdinOTA)
const LocalHTTP = new MultiBackend(null, backendConfig.LocalHTTP)

const plugins = () => {
	/** @type {any[]} */
	const pluginsToUse = [intervalPlural, LanguageDetector]
	if (isBrowser) {
		pluginsToUse.push(ChainedBackend)
	}
	if (process.env.NODE_ENV === 'development') {
		if (isBrowser) {
			import('i18next-hmr/plugin').then(({ HMRPlugin }) =>
				pluginsToUse.push(new HMRPlugin({ webpack: { client: true } }))
			)
		} else {
			import('i18next-hmr/plugin').then(({ HMRPlugin }) =>
				pluginsToUse.push(new HMRPlugin({ webpack: { server: true } }))
			)
		}
	}

	return compact(pluginsToUse)
}

/** @type {import('next-i18next').UserConfig} */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: localeList,
	},
	defaultNS: 'common',
	localePath: path.resolve('./public/locales'),
	fallbackLng: 'en',
	reloadOnPrerender: isDev,
	debug: isDev && isBrowser && isVerbose,
	partialBundledLanguages: true,
	nonExplicitSupportedLngs: true,
	cleanCode: true,
	// react: {
	// 	useSuspense: false,
	// 	bindI18nStore: 'added loaded',
	// 	bindI18n: 'languageChanged loaded',
	// },

	backend: isBrowser
		? {
				backendOptions: [backendConfig.CrowdinOTA, backendConfig.LocalHTTP],
				backends: [CrowdinOTA, LocalHTTP],
			}
		: undefined,
	serializeConfig: false,
	use: plugins(),
	maxParallelReads: 20,
	joinArrays: '',
	interpolation: {
		skipOnVariables: false,
		alwaysFormat: true,
		format: (value, format) => {
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
