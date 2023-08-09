/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { type StorybookConfig } from '@storybook/nextjs'
import isChromatic from 'chromatic/isChromatic'
import dotenv from 'dotenv'
import { mergeAndConcat } from 'merge-anything'
import { type PropItem } from 'react-docgen-typescript'

import path from 'path'

const filePattern = '*.stories.@(ts|tsx)'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDev = process.env.NODE_ENV === 'development'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

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
		'@storybook/addon-interactions',
		'@tomfreudenberg/next-auth-mock/storybook',
		'@storybook/addon-designs',
		'storybook-addon-pseudo-states',
		'@storybook/addon-essentials', // Keep this last
	],
	framework: {
		name: '@storybook/nextjs',
		options: {
			builder: {
				lazyCompilation: Boolean(process.env.SB_LAZY),
				fsCache: Boolean(process.env.SB_CACHE),
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
				},
				roots: [path.resolve(__dirname, '../../../apps/app/public')],
			},
			stats: {
				colors: true,
			},
			devtool: options.configType === 'DEVELOPMENT' ? 'eval-source-map' : undefined,
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
		: { NEXT_PUBLIC_GOOGLE_MAPS_API: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string },
}
export default config
