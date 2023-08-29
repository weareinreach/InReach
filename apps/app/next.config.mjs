/* eslint-disable node/no-process-env */

import bundleAnalyze from '@next/bundle-analyzer'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import { withSentryConfig } from '@sentry/nextjs'
import routes from 'nextjs-routes/config'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

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

const withRoutes = routes({ outDir: './src/types' })
const withBundleAnalyzer = bundleAnalyze({ enabled: shouldAnalyze, openAnalyzer: false })
/** @type {import('next').NextConfig} */
const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: [
		'@weareinreach/api',
		'@weareinreach/auth',
		'@weareinreach/db',
		'@weareinreach/env',
		'@weareinreach/ui',
		'@weareinreach/util',
	],
	compiler: {
		...(isVercelProd ? { removeConsole: { exclude: ['error'] } } : {}),
	},
	experimental: {
		outputFileTracingExcludes: {
			'*': ['**swc+core**', '**esbuild**'],
		},
		outputFileTracingRoot: path.join(__dirname, '../../'),
		instrumentationHook: true,
	},
	eslint: {
		ignoreDuringBuilds: !isVercelProd,
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: '**.4sqi.net' }],
	},
	rewrites: async () => [{ source: '/search', destination: '/' }],

	typescript: {
		ignoreBuildErrors: !isVercelProd,
	},
	webpack: (config, { isServer, webpack }) => {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()]
		}
		if (!isLocalDev) {
			config.plugins.push(new webpack.DefinePlugin({ __SENTRY_DEBUG__: false }))
			if (shouldAnalyze) {
				config.plugins.push(
					new BundleAnalyzerPlugin({ analyzerMode: 'static', generateStatsFile: true, openAnalyzer: false })
				)
			}
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
			silent: true,
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
			hideSourceMaps: false,

			// Automatically tree-shake Sentry logger statements to reduce bundle size
			disableLogger: isVercelProd,
		}
	)

// export default isLocalDev ? defineNextConfig(nextConfig) : defineSentryConfig(defineNextConfig(nextConfig))
export default defineSentryConfig(defineNextConfig(nextConfig))
