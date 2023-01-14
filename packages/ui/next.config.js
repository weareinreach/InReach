/* eslint-disable import/no-unused-modules */
/**
 * @template {import('next').NextConfig} T
 * @param {T} nextConfig - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
// const i18nConfig = require('./next-i18next.config.js')

function defineNextConfig(config) {
	// return withTM(config)
	return config
}
const nextConfig = {
	// i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		// 	transpilePackages: ['@weareinreach/ui'],
		// fontLoaders: [{ loader: '@next/font/google', options: { subsets: ['latin'] } }],
	},
}

module.exports = defineNextConfig(nextConfig)
