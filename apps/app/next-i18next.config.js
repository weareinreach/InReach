/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
// @ts-ignore
const HttpBackend = require('i18next-http-backend/cjs')
/**
 * @template {import('next-i18next').UserConfig} T
 * @type {import('next-i18next').UserConfig}
 * @param {T} config
 * @constraint {{import('next-i18next').UserConfig}}
 */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	debug: process.env.NODE_ENV !== 'production' && !!process.env.NEXT_VERBOSE,

	nonExplicitSupportedLngs: true,
	react: { useSuspense: false },
	backend: {
		backendOptions: {
			loadPath: '/public/locales/{{lng}}/{{ns}}.json',
		},
		backends: typeof window !== 'undefined' ? [HttpBackend] : [],
	},
	serializeConfig: false,
	use: typeof window !== 'undefined' ? [HttpBackend] : [],
}
module.exports = config
