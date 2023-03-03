/* eslint-disable node/no-process-env */
// import { env } from './src/env/server.mjs'
import bundleAnalyze from '@next/bundle-analyzer'
import withRoutes from 'nextjs-routes/config'

import i18nConfig from './next-i18next.config.mjs'

/* eslint-disable-next-line turbo/no-undeclared-env-vars */
const withBundleAnalyzer = bundleAnalyze({ enabled: process.env.ANALYZE === 'true' })
/** @type {import('next').NextConfig} */
const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ['@weareinreach/ui', '@weareinreach/db', '@weareinreach/auth', '@weareinreach/api'],
	experimental: {
		fontLoaders: [{ loader: '@next/font/google', options: { subsets: ['latin'] } }],
		/**
		 * OutputFileTracingIgnores will be in a future version
		 * https://github.com/vercel/next.js/issues/42641#issuecomment-1320713368
		 */
		outputFileTracingIgnores: ['**swc+core**', '**esbuild**'],
	},
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
}

/**
 * Wraps NextJS config with the Bundle Analyzer config.
 *
 * @template {typeof nextConfig} T
 * @param {T} config
 * @returns {T}
 */
function defineNextConfig(config) {
	return withBundleAnalyzer(withRoutes()(config))
}
export default defineNextConfig(nextConfig)
