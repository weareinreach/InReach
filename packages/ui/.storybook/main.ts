import { type StorybookConfig } from '@storybook/nextjs'
import { merge } from 'merge-anything'

import * as path from 'path'

const filePattern = '*.stories.@(js|jsx|ts|tsx|mdx)'

const config: StorybookConfig = {
	stories: [`../components/**/${filePattern}`, `../layout/**/${filePattern}`],
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
		// 'storybook-react-i18next',
	],
	framework: {
		name: '@storybook/nextjs',
		options: {},
	},
	// core: {
	// 	builder: '@storybook/builder-webpack5',
	// },
	features: {
		storyStoreV7: true,
		buildStoriesJson: true,
	},
	typescript: {
		check: true,
		checkOptions: {},
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
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
		}
		const mergedConfig = merge(config, configAdditions)
		return mergedConfig
	},
	docs: {
		autodocs: true,
	},
}
export default config
