/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { type StorybookConfig } from '@storybook/nextjs'
import { mergeAndConcat } from 'merge-anything'
import { type PropItem } from 'react-docgen-typescript'

import * as path from 'path'

const filePattern = '*.stories.@(ts|tsx)'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDev = process.env.NODE_ENV === 'development'

const config: StorybookConfig = {
	// stories: [`../!(node_modules)/**/${filePattern}`, '../other/**/*.mdx'],
	stories: [`../(components|hooks|icon|layouts|modals|other)/**/${filePattern}`, '../other/**/*.mdx'],
	staticDirs: [
		{
			from: '../../../apps/app/public',
			to: 'public/',
		},
		'../public',
	],
	addons: [
		'@geometricpanda/storybook-addon-badges',
		'@storybook/addon-a11y',
		'@storybook/addon-interactions',
		'@tomfreudenberg/next-auth-mock/storybook',
		'storybook-addon-designs',
		'storybook-addon-pseudo-states',
		// 'css-chaos-addon',
		'storybook-addon-swc',
		'@storybook/addon-essentials', // Keep this last
	],
	framework: {
		name: '@storybook/nextjs',
		options: {
			builder: {
				lazyCompilation: Boolean(process.env.SB_LAZY),
				fsCache: Boolean(process.env.SB_CACHE),
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
			// tsconfigPath: path.resolve(__dirname, '../tsconfig.storybook.json'),
			exclude: ['node_modules'],
			propFilter: (prop: PropItem) => {
				const pathTest = /node_modules\/(?!(?:\.pnpm\/)?@mantine(?!.?styles))/
				// if (prop.parent && !pathTest.test(prop.parent.fileName)) console.log(prop)
				return prop.parent ? !pathTest.test(prop.parent.fileName) : true
			},
		},
	},
	webpackFinal: (config) => {
		const configAdditions: typeof config = {
			resolve: {
				alias: {
					/** Next-Auth session mock */
					'@tomfreudenberg/next-auth-mock/storybook/preview-mock-auth-states': path.resolve(
						__dirname,
						'mockAuthStates.ts'
					),
					'next-i18next': 'react-i18next',
				},
				roots: [path.resolve(__dirname, '../../../apps/app/public')],
				fallback: {
					fs: false,
					assert: false,
					buffer: false,
					console: false,
					constants: false,
					crypto: false,
					domain: false,
					events: false,
					http: false,
					https: false,
					os: false,
					path: false,
					punycode: false,
					process: false,
					querystring: false,
					stream: false,
					string_decoder: false,
					sys: false,
					timers: false,
					tty: false,
					url: false,
					util: false,
					v8: false,
					vm: false,
					zlib: false,
				},
			},
			stats: {
				colors: true,
			},
			// devtool: isDev ? 'eval-source-map' : 'cheap-module-source-map',
		}
		const mergedConfig = mergeAndConcat(config, configAdditions)
		return mergedConfig
	},
	docs: {
		autodocs: true,
	},
}
export default config
