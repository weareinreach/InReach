/**
 * @template {import('next').NextConfig} T
 * @param {T} nextConfig - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */

// const withTM = require('next-transpile-modules')(['@inreach/ui'])

function defineNextConfig(config) {
	// return withTM(config)
	return config
}
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		transpilePackages: ['@inreach/ui'],
	},
}

export default defineNextConfig(nextConfig)
