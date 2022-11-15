import * as path from 'path'

const filePattern = '*.stories.@(js|jsx|ts|tsx|mdx)'

const config = {
	stories: [`../components/**/${filePattern}`, `../layout/**/${filePattern}`],
	staticDirs: ['../../../apps/app/public'],
	addons: [
		'@geometricpanda/storybook-addon-badges',
		'@storybook/addon-a11y',
		'@storybook/addon-console',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-links',
		'@tomfreudenberg/next-auth-mock/storybook',
		'storybook-addon-designs',
		'storybook-addon-mantine',
		'storybook-addon-next',
		'storybook-addon-swc',
		// 'storybook-addon-turbo-build',
		'storybook-dark-mode',
		'storybook-mobile',
		'storybook-react-i18next',
	],
	framework: '@storybook/react',
	core: {
		builder: 'webpack5',
	},
	features: { storyStoreV7: true },
	webpackFinal: async (config: Record<string, any>) => {
		/** Next-Auth session mock */
		;(config.resolve.alias['@tomfreudenberg/next-auth-mock/storybook/preview-mock-auth-states'] =
			path.resolve(__dirname, 'mockAuthStates.ts')),
			(config.resolve.alias['next-i18next'] = 'react-i18next')
		/**
		 * Fixes font import with /
		 *
		 * @see https://github.com/storybookjs/storybook/issues/12844#issuecomment-867544160
		 */
		// config.resolve.roots = [
		// 	path.resolve(__dirname, "../public"),
		// 	"node_modules",
		// ];
		// config.resolve.alias = {
		// 	...config.resolve.alias,
		// 	"@/interfaces": path.resolve(__dirname, "../interfaces"),
		// };
		/**
		 * Why webpack5... Just why?
		 *
		 * @type {{
		 * 	console: boolean
		 * 	process: boolean
		 * 	timers: boolean
		 * 	os: boolean
		 * 	querystring: boolean
		 * 	sys: boolean
		 * 	fs: boolean
		 * 	url: boolean
		 * 	crypto: boolean
		 * 	path: boolean
		 * 	zlib: boolean
		 * 	punycode: boolean
		 * 	util: boolean
		 * 	stream: boolean
		 * 	assert: boolean
		 * 	string_decoder: boolean
		 * 	domain: boolean
		 * 	vm: boolean
		 * 	tty: boolean
		 * 	http: boolean
		 * 	buffer: boolean
		 * 	constants: boolean
		 * 	https: boolean
		 * 	events: boolean
		 * }}
		 */
		config.resolve.fallback = {
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
			vm: false,
			zlib: false,
		}
		return config
	},
}
export default config
