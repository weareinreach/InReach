/* eslint-disable import/no-unused-modules */
// @ts-check
/** @type {import('next-i18next').UserConfig} */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	nonExplicitSupportedLngs: true,
}

module.exports = config
