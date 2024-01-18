/* eslint-disable node/no-process-env */
// @ts-check
import LanguageDetector from 'i18next-browser-languagedetector'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import intervalPlural from 'i18next-intervalplural-postprocessor'
// import LocalStorageBackend from 'i18next-localstorage-backend'
import MultiBackend from 'i18next-multiload-backend-adapter'

import path from 'path'

// @ts-expect-error - yelling about declaration file
import { localeList } from '@weareinreach/db/generated/locales.mjs'

const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV !== 'production'
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

const plugins = () => {
	/** @type {any[]} */
	const pluginsToUse = [intervalPlural, LanguageDetector]
	if (isBrowser) {
		pluginsToUse.push(ChainedBackend)
		if (isDev) {
			// @ts-expect-error It is a valid package..
			import('i18next-hmr/plugin').then(({ HMRPlugin }) =>
				pluginsToUse.push(new HMRPlugin({ webpack: { client: true } }))
			)
		}
	} else {
		if (isDev) {
			// @ts-expect-error It is a valid package..
			import('i18next-hmr/plugin').then(({ HMRPlugin }) =>
				pluginsToUse.push(new HMRPlugin({ webpack: { server: true } }))
			)
		}
	}

	return pluginsToUse
}

/** @type {import('next-i18next').UserConfig} */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: localeList,
	},
	defaultNS: 'common',
	localePath: path.resolve('./public/locales'),
	fallbackLng: ['en'],
	reloadOnPrerender: isDev,
	debug: isDev && isBrowser && isVerbose,
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
