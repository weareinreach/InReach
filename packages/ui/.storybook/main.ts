/* eslint-disable node/no-process-env */
import { type StorybookConfig } from '@storybook/nextjs'
import isChromatic from 'chromatic/isChromatic'
import dotenv from 'dotenv'
// @ts-expect-error It is a valid package..
import { I18NextHMRPlugin } from 'i18next-hmr/webpack'
import { mergeAndConcat } from 'merge-anything'
import { type PropItem } from 'react-docgen-typescript'

import path, { dirname, join } from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDev = process.env.NODE_ENV === 'development'

const getAbsolutePath = (value: string) => {
	const abPath = dirname(require.resolve(join(value, 'package.json')))
	return abPath
}

const publicStatic = path.resolve(__dirname, '../../../apps/app/public')

const config: StorybookConfig = {
	stories: [
		'../components/**/*.stories.{ts,tsx}',
		'../hooks/**/*.stories.{ts,tsx}',
		'../icon/**/*.stories.{ts,tsx}',
		'../layouts/**/*.stories.{ts,tsx}',
		'../modals/**/*.stories.{ts,tsx}',
		'../other/**/*.stories.{ts,tsx}',
		'../other/**/*.mdx',
	],
	staticDirs: [
		{
			from: '../../../apps/app/public',
			to: 'public/',
		},
		'../public',
	],
	addons: [
		getAbsolutePath('@storybook/addon-essentials'),
		getAbsolutePath('@geometricpanda/storybook-addon-badges'),
		getAbsolutePath('@storybook/addon-a11y'),
		// eslint-disable-next-line storybook/no-uninstalled-addons
		'@tomfreudenberg/next-auth-mock/storybook', // This addon doesn't like to be wrapped.
		getAbsolutePath('@storybook/addon-designs'),
		getAbsolutePath('storybook-addon-pseudo-states'),
		getAbsolutePath('@storybook/addon-interactions'),
		'@storybook/addon-webpack5-compiler-swc',
	],
	framework: {
		name: '@storybook/nextjs',
		options: {
			builder: {
				lazyCompilation: Boolean(process.env.SB_LAZY),
				fsCache: true, // Boolean(process.env.SB_CACHE),
				useSWC: true,
			},
			nextConfigPath: path.resolve(__dirname, '../../../apps/app/next.config.mjs'),
			fastRefresh: true,
			strictMode: true,
		},
	},
	features: {
		buildStoriesJson: true,
	},
	typescript: {
		check: false,
		checkOptions: {},
		reactDocgen: process.env.SB_GEN_DOCS ? 'react-docgen-typescript' : false,
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			shouldExtractValuesFromUnion: false,
			shouldRemoveUndefinedFromOptional: true,
			shouldIncludePropTagMap: true,
			compilerOptions: {
				allowSyntheticDefaultImports: false,
				esModuleInterop: false,
			},
			exclude: ['node_modules'],
			propFilter: (prop: PropItem) => {
				const pathTest = /node_modules\/(?!(?:\.pnpm\/)?@mantine(?!.?styles))/
				return prop.parent ? !pathTest.test(prop.parent.fileName) : true
			},
		},
	},
	previewHead: (head) => `
	<script src='http://localhost:8097'></script>
	${head}
	`,
	webpackFinal: (config, options) => {
		const configAdditions: typeof config = {
			resolve: {
				alias: {
					/** Next-Auth session mock */
					'@tomfreudenberg/next-auth-mock/storybook/preview-mock-auth-states': path.resolve(
						__dirname,
						'mockAuthStates.ts'
					),
					'next-i18next': 'react-i18next',
					'msw/native': path.resolve(__dirname, '../node_modules/msw/lib/native/index.mjs'),
				},
				roots: [publicStatic],
			},
			stats: {
				colors: true,
			},
			devtool: options.configType === 'DEVELOPMENT' ? 'eval-source-map' : undefined,
		}

		/** I18 HMR */
		if (options.configType === 'DEVELOPMENT') {
			const plugin = new I18NextHMRPlugin({
				localesDir: path.resolve(__dirname, '../../../apps/app/public/locales'),
			})

			Array.isArray(config.plugins) ? config.plugins.push(plugin) : (config.plugins = [plugin])
		}

		const mergedConfig = mergeAndConcat(config, configAdditions)
		return mergedConfig
	},
	docs: {
		autodocs: true,
	},
	env: isChromatic()
		? {
				SKIP_ENV_VALIDATION: 'true',
			}
		: {
				NEXT_PUBLIC_GOOGLE_MAPS_API: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
				STORYBOOK_PROJECT_ROOT: path.resolve(__dirname, '../'),
			},
}
export default config
