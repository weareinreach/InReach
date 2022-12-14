// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { env } from './src/env/server.mjs'
import bundleAnalyze from '@next/bundle-analyzer'

import i18nConfig from './next-i18next.config.js'

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
	return withBundleAnalyzer(config)
}

export default defineNextConfig({
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
})
