/* eslint-disable node/no-process-env */

import bundleAnalyze from '@next/bundle-analyzer'
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'
import { RelativeCiAgentWebpackPlugin } from '@relative-ci/agent'
import { withSentryConfig } from '@sentry/nextjs'
import { I18NextHMRPlugin } from 'i18next-hmr/webpack'
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

// A stray barrel export (`export * from './Rating.test'`) once let a Vitest test file get
// bundled into the real app, crashing the build with `vi.queueMock() is forbidden` (vitest's
// mocking internals only work inside its own test runner). Webpack only bundles what's
// actually reachable from an entry point, so this can only happen via an accidental import -
// fail the build loudly if it ever happens again, instead of silently shipping broken code.
class ForbidTestFilesInBundlePlugin {
	static testFilePattern = /\.(test|spec)\.[cm]?[jt]sx?$/
	apply(/** @type {import('webpack').Compiler} */ compiler) {
		compiler.hooks.compilation.tap('ForbidTestFilesInBundlePlugin', (compilation) => {
			compilation.hooks.finishModules.tap('ForbidTestFilesInBundlePlugin', (modules) => {
				for (const webpackModule of modules) {
					const resource = /** @type {{ resource?: string }} */ (webpackModule).resource
					if (resource && ForbidTestFilesInBundlePlugin.testFilePattern.test(resource)) {
						compilation.errors.push(
							/** @type {any} */ (
								new Error(
									`Test file is reachable from the app bundle: ${resource}\n` +
										'Something imports this test file, directly or via a barrel export - ' +
										'check for a stray `export * from` in a codegen-managed index file.'
								)
							)
						)
					}
				}
			})
		})
	}
}
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
		'react-hook-consent',
	],
	compiler: {
		...(isVercelProd ? { removeConsole: { exclude: ['error'] } } : {}),
	},
	experimental: {
		// outputFileTracingRoot: path.join(__dirname, '../../'),
		instrumentationHook: true,
		webpackBuildWorker: true,
	},
	eslint: {
		ignoreDuringBuilds: false,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: '**.4sqi.net' }],
	},
	rewrites: async () => [{ source: '/search', destination: '/' }],
	webpack: (config, { dev, isServer, webpack }) => {
		config.plugins.push(new ForbidTestFilesInBundlePlugin())

		// next-i18next@16's `./pages` export declares matching `import`/`require` conditions
		// pointing at separate .mjs/.cjs builds. Next's SWC/webpack pipeline sometimes
		// misjudges which one it's looking at for this package, emitting CJS-shaped output
		// (`Object.defineProperty(exports, ...)`) into a chunk wrapped as ESM (no `exports`
		// binding), throwing `ReferenceError: exports is not defined` in the client bundle
		// (see vercel/next.js#59603 for the same signature on a different package). Aliasing
		// straight to the unambiguous .cjs build removes the import/require condition
		// ambiguity that triggers the misdetection.
		config.resolve.alias['next-i18next/pages'] = path.join(nextI18nextRoot, 'dist/pagesRouter/index.cjs')
		config.resolve.alias['next-i18next/pages/serverSideTranslations'] = path.join(
			nextI18nextRoot,
			'dist/pagesRouter/serverSideTranslations.cjs'
		)
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()]
		}
		if (!dev && !isServer) {
			config.plugins.push(
				new RelativeCiAgentWebpackPlugin({
					stats: { excludeAssets: [/.*\/webpack-stats\.json/, /build-manifest\.json/] },
				})
			)
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

		// Automatically tree-shake Sentry logger statements to reduce bundle size
		disableLogger: isVercelProd || isVercelActiveDev,
		automaticVercelMonitors: true,
		autoInstrumentMiddleware: true,
	})

export default isLocalDev ? defineNextConfig(nextConfig) : defineSentryConfig(defineNextConfig(nextConfig))
// export default defineSentryConfig(defineNextConfig(nextConfig))
