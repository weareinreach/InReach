/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { type StorybookConfig } from '@storybook/nextjs'
import { merge } from 'merge-anything'
import { PropItem } from 'react-docgen-typescript'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import * as path from 'path'

const filePattern = '*.stories.@(ts|tsx)'

const config: StorybookConfig = {
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
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-links',
		'@tomfreudenberg/next-auth-mock/storybook',
		'storybook-addon-designs',
		'storybook-addon-pseudo-states',
		'css-chaos-addon',
		'storybook-addon-swc',
		// {
		// 	name: 'storybook-addon-swc',
		// 	options: {
		// 		swcLoaderOptions: {
		// 			jsc: {
		// 				target: 'es2016',
		// 			},
		// 		},
		// 		swcMinifyOptions: {
		// 			compress: {
		// 				ecma: 2016,
		// 			},
		// 		},
		// 	},
		// },
		'@storybook/addon-actions', // Keep this one last
	],
	framework: {
		name: '@storybook/nextjs',
		options: {
			builder: {
				// lazyCompilation: true,
				// fsCache: true,
			},
			nextConfigPath: path.resolve(__dirname, '../../../apps/app/next.config.mjs'),
			fastRefresh: true,
		},
	},
	features: {
		buildStoriesJson: true,
	},
	refs: {
		// chromatic: {
		// 	// The title of your Storybook
		// 	title: 'InReach Design System',
		// 	// The url provided by Chromatic when it was published
		// 	url: 'https://dev--632cabf2eef8a2954cd3cbc6.chromatic.com',
		// },
	},
	typescript: {
		check: false,
		reactDocgen: process.env.SKIP_DOCS ? false : 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			shouldRemoveUndefinedFromOptional: true,
			shouldExtractValuesFromUnion: false,
			shouldIncludePropTagMap: true,
			tsconfigPath: path.resolve(__dirname, '../tsconfig.storybook.json'),
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
					// '@weareinreach/api': path.resolve(__dirname, '../../api'),
					'next-i18next': 'react-i18next',
					// 'next/font': 'storybook-nextjs-font-loader',
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
				plugins: [
					new TsconfigPathsPlugin({
						extensions: config.resolve?.extensions,
					}),
				],
			},
		}
		const mergedConfig = merge(config, configAdditions)
		return mergedConfig
	},
	docs: {
		autodocs: true,
	},
}
export default config
