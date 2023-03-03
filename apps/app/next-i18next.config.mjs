/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
// @ts-ignore
// const HttpBackend = require('i18next-http-backend/cjs')
import { I18nextKeysOnDemand } from '@weareinreach/i18next-keys-ondemand'
import axios from 'axios'
import HttpBackend from 'i18next-http-backend'
import { z } from 'zod'

export const namespaces = [
	'attribute',
	'common',
	// 'country',
	// 'gov-dist',
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
		locales: ['en', 'es'], // ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	fallbackLng: ['en', 'es'],
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	debug: true, //process.env.NODE_ENV !== 'production' && !!process.env.NEXT_VERBOSE,

	nonExplicitSupportedLngs: true,
	react: {
		useSuspense: true,
	},
	saveMissing: true,
	backend: {
		backendOptions: {
			// loadPath: '/public/locales/{{lng}}/{{ns}}.json',
			translationGetter: onDemandFetcher,
		},
		backends: typeof window !== 'undefined' ? [onDemand] : [onDemand],
	},
	serializeConfig: false,
	updateMissing: true,
	use: typeof window !== 'undefined' ? [onDemand] : [onDemand],
}
export default config
