/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
// import { env } from './src/env/server.mjs'
/* eslint-disable import/first */

import bundleAnalyze from '@next/bundle-analyzer'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import { withSentryConfig } from '@sentry/nextjs'
import withRoutes from 'nextjs-routes/config'

import path from 'path'
import { fileURLToPath } from 'url'

import i18nConfig from './next-i18next.config.mjs'
// import * as otel from './otel.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isVercelActiveDev = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF !== 'dev'

// const loadOtel = async () => {
// 	if (process.env.NEXT_RUNTIME === 'nodejs') {
// 		await import('./otel.mjs')
// 	}
// }

/* eslint-disable-next-line turbo/no-undeclared-env-vars */
const withBundleAnalyzer = bundleAnalyze({ enabled: process.env.ANALYZE === 'true' })
/** @type {import('next').NextConfig} */
const nextConfig = {
	i18n: i18nConfig.i18n,
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ['@weareinreach/ui', '@weareinreach/db', '@weareinreach/auth', '@weareinreach/api'],
	compiler: {
		...(process.env.VERCEL_ENV === 'production' ? { removeConsole: { exclude: ['error'] } } : {}),
	},
	experimental: {
		// fontLoaders: [{ loader: 'next/font/google', options: { subsets: ['latin'] } }],
		outputFileTracingExcludes: {
			'*': ['**swc+core**', '**esbuild**'],
		},
		outputFileTracingRoot: path.join(__dirname, '../../'),
		instrumentationHook: true,
		// turbotrace: {
		// 	logDetail: true,
		// },
	},
	eslint: {
		ignoreDuringBuilds: isVercelActiveDev,
	},
	typescript: {
		ignoreBuildErrors: isVercelActiveDev,
	},
	webpack: (config, { isServer, webpack }) => {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()]
		}
		config.plugins.push(new webpack.DefinePlugin({ __SENTRY_DEBUG__: false }))
		return config
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
	// loadOtel()
	return withBundleAnalyzer(withRoutes()(config))
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
			transpileClientSDK: true,

			// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
			tunnelRoute: '/monitoring',

			// Hides source maps from generated client bundles
			hideSourceMaps: true,

			// Automatically tree-shake Sentry logger statements to reduce bundle size
			disableLogger: true,
		}
	)
// export default defineNextConfig(nextConfig)
export default defineSentryConfig(defineNextConfig(nextConfig))
