/* eslint-disable node/no-process-env */
// @ts-check
/* eslint-disable import/no-unused-modules */
// const { env } = require('@weareinreach/config')
/** @type {import('next-i18next').UserConfig} */
const config = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	nonExplicitSupportedLngs: true,
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	react: { useSuspense: false },
	localePath: '../../apps/app/public/locales',
}
module.exports = config
