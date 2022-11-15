/**
 * @template {import('next').NextConfig} T
 * @param {T} nextConfig - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
// const i18nConfig = require('./next-i18next.config.js')

// const withTM = require('next-transpile-modules')(['@weareinreach/ui'])

function defineNextConfig(config) {
	// return withTM(config)
	return config
}
const nextConfig = {
	// i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	// experimental: {
	// 	transpilePackages: ['@weareinreach/ui'],
	// },
}

module.exports = defineNextConfig(nextConfig)
