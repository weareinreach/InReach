/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
/**
 * @template {import('next-i18next').UserConfig} T
 * @param {T} config
 * @constraint {{import('next-i18next').UserConfig}}
 */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	nonExplicitSupportedLngs: true,
	react: { useSuspense: false },
}
module.exports = config
