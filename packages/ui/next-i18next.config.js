// @ts-check

/**
 * @template {import('next-i18next').UserConfig} T
 * @param {T} config
 * @constraint {{import('next-i18next').UserConfig}}
 */
const config = {
	i18n: {
		defaultLocale: 'en-US',
		locales: ['en-US', 'en-CA', 'en-MX', 'es', 'es-US', 'es-MX'],
	},
	reloadOnPrerender: process.env.NODE_ENV !== 'production',
	nonExplicitSupportedLngs: true,
	react: { useSuspense: false },
	localePath: '../../apps/app/public/locales',
}
module.exports = config
