/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['@inreach/ui'])

function defineNextConfig(config) {
	return withTM(config)
}
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
}

module.exports = defineNextConfig(nextConfig)
