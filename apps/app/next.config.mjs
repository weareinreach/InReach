// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { env } from './src/env/server.mjs'
import bundleAnalyze from '@next/bundle-analyzer'
import transpiler from 'next-transpile-modules'

import i18nConfig from './next-i18next.config.mjs'

const withTM = transpiler(['@weareinreach/ui', '@weareinreach/db'], { resolveSymlinks: true, debug: true })
/* eslint-disable-next-line turbo/no-undeclared-env-vars */
const withBundleAnalyzer = bundleAnalyze({ enabled: process.env.ANALYZE === 'true' })
/**
 * Don't be scared of the generics here. All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
	// return withTM(config)
	return withBundleAnalyzer(withTM(config))
}

export default defineNextConfig({
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	// experimental: {
	// 	transpilePackages: ['@weareinreach/ui', '@weareinreach/db'],
	// },
	// async rewrites() {
	// 	return {
	// 		fallback: [
	// 			{
	// 				source: '/:path*',
	// 				destination: 'https://inreach-v1.vercel.app/:path*',
	// 			},
	// 		],
	// 	}
	// },
})
