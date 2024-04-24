/* eslint-disable node/no-process-env */

import filterWebpackStats from '@bundle-stats/plugin-webpack-filter'
import bundleAnalyze from '@next/bundle-analyzer'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/agent'
import { withSentryConfig } from '@sentry/nextjs'
import { I18NextHMRPlugin } from 'i18next-hmr/webpack'
import routes from 'nextjs-routes/config'
import { StatsWriterPlugin } from 'webpack-stats-plugin'

import path from 'path'
import { fileURLToPath } from 'url'

import i18nConfig from './next-i18next.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isVercelActiveDev = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF !== 'dev'
const isVercelProd = process.env.VERCEL_ENV === 'production'
const isLocalDev =
	process.env.NODE_ENV === 'development' && !['preview', 'production'].includes(process.env.VERCEL_ENV)
const shouldAnalyze = process.env.ANALYZE === 'true'
const renovateRegex = /^renovate\/.*$/
const isRenovatePR = renovateRegex.test(process.env.VERCEL_GIT_COMMIT_REF)

const withRoutes = routes({ outDir: './src/types' })
const withBundleAnalyzer = bundleAnalyze({ enabled: shouldAnalyze, openAnalyzer: false })
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: [
		'@weareinreach/analytics',
		'@weareinreach/api',
		'@weareinreach/auth',
		'@weareinreach/config',
		'@weareinreach/crowdin',
		'@weareinreach/db',
		'@weareinreach/env',
		'@weareinreach/ui',
		'@weareinreach/util',
	],
	compiler: {
		...(isVercelProd ? { removeConsole: { exclude: ['error'] } } : {}),
	},
	experimental: {
		// outputFileTracingRoot: path.join(__dirname, '../../'),
		// instrumentationHook: true,
		webpackBuildWorker: true,
		serverComponentsExternalPackages: ['@sentry/profiling-node'],
	},
	eslint: {
		ignoreDuringBuilds: !(isVercelProd || isRenovatePR),
	},
	typescript: {
		ignoreBuildErrors: !(isVercelProd || isRenovatePR),
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: '**.4sqi.net' }],
	},
	rewrites: async () => [{ source: '/search', destination: '/' }],
	webpack: (config, { dev, isServer, webpack }) => {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()]
		}
		if (!dev && !isServer) {
			config.plugins.push(
				new RelativeCiAgentWebpackPlugin({
					stats: { excludeAssets: [/.*\/webpack-stats\.json/, /build-manifest\.json/] },
				})
			)
			// config.plugins.push(
			// 	new StatsWriterPlugin({
			// 		filename: '../webpack-stats.json',
			// 		stats: {
			// 			assets: true,
			// 			chunks: true,
			// 			modules: true,
			// 			chunkModules: true,
			// 			excludeAssets: [/.*\/webpack-stats\.json/, /build-manifest\.json/],
			// 		},
			// 		transform: (webpackStats) => {
			// 			if (filterWebpackStats instanceof Function) {
			// 				const filteredSource = filterWebpackStats(webpackStats)
			// 				return JSON.stringify(filteredSource)
			// 			} else if (filterWebpackStats.default instanceof Function) {
			// 				const filteredSource = filterWebpackStats.default(webpackStats)
			// 				return JSON.stringify(filteredSource)
			// 			}
			// 			return JSON.stringify(webpackStats)
			// 		},
			// 	})
			// )
		}
		if (dev && !isServer) {
			/** WDYR */
			const origEntry = config.entry
			config.entry = async () => {
				const wdyrPath = path.resolve(__dirname, './lib/wdyr.ts')
				const entries = await origEntry()
				if (entries['main.js'] && !entries['main.js'].includes(wdyrPath)) {
					entries['main.js'].push(wdyrPath)
				}
				return entries
			}
			/** I18 HMR */

			config.plugins.push(
				new I18NextHMRPlugin({
					localesDir: path.resolve(__dirname, './public/locales'),
				})
			)
		}

		if (!isLocalDev) {
			config.plugins.push(
				new webpack.DefinePlugin({
					__SENTRY_DEBUG__: false,
					__RRWEB_EXCLUDE_CANVAS__: true,
					__RRWEB_EXCLUDE_IFRAME__: true,
					__RRWEB_EXCLUDE_SHADOW_DOM__: true,
				})
			)
		}
		return config
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'Access-Control-Allow-Headers', value: 'sentry-trace' },
					{ key: 'Access-Control-Allow-Headers', value: 'baggage' },
					{ key: 'Document-Policy', value: 'js-profiling' },
				],
			},
		]
	},
}

/**
 * Wraps NextJS config with the Bundle Analyzer config.
 *
 * @template {typeof nextConfig} T
 * @param {T} config
 * @returns {T}
 */
function defineNextConfig(config) {
	return withBundleAnalyzer(withRoutes(config))
}
/**
 * Wraps NextJS config with the Sentry config.
 *
 * @template {typeof nextConfig} T
 * @param {T} nextConfig
 * @returns {T}
 */
const defineSentryConfig = (nextConfig) =>
	withSentryConfig(
		nextConfig,
		{
			// For all available options, see:
			// https://github.com/getsentry/sentry-webpack-plugin#options

			// Suppresses source map uploading logs during build
			silent: !process.env.SENTRY_DEBUG,
			org: 'weareinreach',
			project: 'inreach-app',
		},
		{
			// For all available options, see:
			// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

			// Upload a larger set of source maps for prettier stack traces (increases build time)
			widenClientFileUpload: true,

			// Transpiles SDK to be compatible with IE11 (increases bundle size)
			transpileClientSDK: false,

			// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
			tunnelRoute: '/monitoring',

			// Hides source maps from generated client bundles
			hideSourceMaps: !isLocalDev,

			// Automatically tree-shake Sentry logger statements to reduce bundle size
			disableLogger: isVercelProd || isVercelActiveDev,
			automaticVercelMonitors: true,
			autoInstrumentMiddleware: true,
		}
	)

export default isLocalDev ? defineNextConfig(nextConfig) : defineSentryConfig(defineNextConfig(nextConfig))
// export default defineSentryConfig(defineNextConfig(nextConfig))
