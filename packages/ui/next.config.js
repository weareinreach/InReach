/* eslint-disable import/no-unused-modules */
const i18nConfig = require('./next-i18next.config.js')
/** @type {import('next').NextConfig} */
const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		transpilePackages: ['@weareinreach/db', '@weareinreach/auth', '@weareinreach/api'],
		// fontLoaders: [{ loader: '@next/font/google', options: { subsets: ['latin'] } }],
	},
}
function defineNextConfig(config) {
	// return withTM(config)
	return config
}

module.exports = defineNextConfig(nextConfig)
