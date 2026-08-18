/* eslint-disable node/no-process-env */

import bundleAnalyze from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import createJiti from 'jiti'
import routes from 'nextjs-routes/config'

import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

import i18nConfig from './next-i18next.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const jiti = createJiti(__filename)
// next-i18next's package.json `exports` map only exposes `./pages`, `./package.json`, etc. -
// deep dist paths aren't declared subpaths, so `require.resolve()` on them directly throws
// ERR_PACKAGE_PATH_NOT_EXPORTED. Resolve the package root via the declared `./package.json`
// subpath instead, then join the relative dist path manually.
const nextI18nextRoot = path.dirname(require.resolve('next-i18next/package.json'))
jiti('../../packages/env')

const isVercelActiveDev = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF !== 'dev'
const isVercelProd = process.env.VERCEL_ENV === 'production'
const isVercelStaging = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'dev'
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
		'react-hook-consent',
	],
	compiler: {
		...(isVercelProd ? { removeConsole: { exclude: ['error'] } } : {}),
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: '**.4sqi.net' }],
	},
	rewrites: async () => [{ source: '/search', destination: '/' }],
	// next-i18next@16's `./pages` export declares matching `import`/`require` conditions
	// pointing at separate .mjs/.cjs builds. Next's bundler pipeline has previously misjudged
	// which one it's looking at for this package, emitting CJS-shaped output into a chunk
	// wrapped as ESM (see vercel/next.js#59603 for the same signature on a different package).
	// Aliasing straight to the unambiguous .cjs build removes the import/require condition
	// ambiguity that triggers the misdetection.
	turbopack: {
		// Turbopack's resolveAlias doesn't accept raw absolute filesystem paths the way webpack's
		// resolve.alias does - it needs a path relative to this config file.
		resolveAlias: {
			'next-i18next/pages': `./${path.relative(__dirname, path.join(nextI18nextRoot, 'dist/pagesRouter/index.cjs'))}`,
			'next-i18next/pages/serverSideTranslations': `./${path.relative(__dirname, path.join(nextI18nextRoot, 'dist/pagesRouter/serverSideTranslations.cjs'))}`,
		},
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
	withSentryConfig(nextConfig, {
		// For all available options, see:
		// https://github.com/getsentry/sentry-webpack-plugin#options

		// Suppresses source map uploading logs during build
		silent: !process.env.SENTRY_DEBUG,
		org: 'weareinreach',
		project: 'inreach-app',
		// For all available options, see:
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Transpiles SDK to be compatible with IE11 (increases bundle size)
		transpileClientSDK: false,

		// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
		tunnelRoute: '/monitoring',

		// Bundler-agnostic (works under Turbopack, unlike the older webpack.treeshake.* options).
		bundleSizeOptimizations: {
			excludeDebugStatements: isVercelProd || isVercelActiveDev,
			excludeReplayShadowDom: true,
			excludeReplayIframe: true,
		},
	})

export default isLocalDev ? defineNextConfig(nextConfig) : defineSentryConfig(defineNextConfig(nextConfig))
