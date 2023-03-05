/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
// @ts-ignore
// const HttpBackend = require('i18next-http-backend/cjs')
import CrowdinOtaBackend from '@weareinreach/i18next-crowdin-ota-backend'
import { I18nextKeysOnDemand } from '@weareinreach/i18next-keys-ondemand'
import axios from 'axios'
import HttpBackend from 'i18next-http-backend'
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

const Keys = z.record(z.string())

/** @type {import('@weareinreach/i18next-keys-ondemand').TranslationGetter} */
const onDemandFetcher = async (keys, lang, ns, defaultValues) => {
	console.log('fetcher called', { keys, lang, ns, defaultValues })
	try {
		const { data } = await axios.post('/api/i18n/get', { keys, lang, ns, defaultValues })
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
export const crowdinOpts = {
	hash: 'e-39328dacf5f98928e8273b35wj',
	nsFileMap: {
		databaseStrings: '/database/org-data.json',
		common: '/dev/common.json',
		country: '/dev/country.json',
		footer: '/dev/footer.json',
		nav: '/dev/nav.json',
		socialMedia: '/dev/socialMedia.json',
		user: '/dev/user.json',
		'gov-dist': '/dev/gov-dist.json',
		attribute: '/dev/attribute.json',
		services: '/dev/services.json',
	},
	// redisUrl: process.env.REDIS_URL,
}

// const crowdinBackend = new CrowdinOtaBackend(undefined, )
const apiPath = '/api/i18n/load?lng={{lng}}&ns={{ns}}'
const httpBackend = new HttpBackend(null, {
	loadPath: typeof window !== 'undefined' ? apiPath : `http://localhost:3000${apiPath}`,
	allowMultiLoading: true,
})

const multi = new MultiBackend(null, {
	backend: HttpBackend,
	debounceInterval: 200,
	backendOption: {
		loadPath: typeof window !== 'undefined' ? apiPath : `http://localhost:3000${apiPath}`,
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
	fallbackLng: ['en'],
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	debug: true, //process.env.NODE_ENV !== 'production' && !!process.env.NEXT_VERBOSE,

	partialBundledLanguages: true,
	nonExplicitSupportedLngs: true,
	cleanCode: true,
	react: {
		useSuspense: false,
	},
	// saveMissing: true,
	backend: {
		// 	backendOptions: {
		// 		// translationGetter: onDemandFetcher,
		// 		allowMultiLoading: true,
		// 		loadPath: typeof window !== 'undefined' ? apiPath : `http://localhost:3000${apiPath}`,
		// 	},
		// 	debounceInterval: 200,
		// 	backends: [onDemand], //typeof window !== 'undefined' ? [onDemand] : [onDemand],
	},
	serializeConfig: false,
	// updateMissing: true,
	use: [multi], //typeof window !== 'undefined' ? [multi] : [multi],
}
export default config
