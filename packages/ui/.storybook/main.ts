import { type StorybookConfig } from '@storybook/nextjs'
import { merge } from 'merge-anything'
import { PropItem } from 'react-docgen-typescript'
import { Component } from 'react-docgen-typescript/lib/parser'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import * as path from 'path'

const filePattern = '*.stories.@(js|jsx|ts|tsx|mdx)'

const config: StorybookConfig = {
	stories: [`../(components|hooks|layout|modals)/**/${filePattern}`],
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
		'storybook-addon-swc',
		'@storybook/addon-actions', // Keep this one last
	],
	framework: {
		name: '@storybook/nextjs',
		options: {
			builder: {},
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
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			shouldRemoveUndefinedFromOptional: true,
			shouldExtractValuesFromUnion: true,
			shouldIncludePropTagMap: true,
			tsconfigPath: path.resolve(__dirname, '../tsconfig.json'),
			propFilter: (prop: PropItem, component: Component) => {
				if (prop.declarations !== undefined && prop.declarations.length > 0) {
					const hasPropAdditionalDescription = prop.declarations.find((declaration) => {
						return !declaration.fileName.includes('node_modules')
					})

					return Boolean(hasPropAdditionalDescription)
				}

				return true
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
					'@next/font': 'storybook-nextjs-font-loader',
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
