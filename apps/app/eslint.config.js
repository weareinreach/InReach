const nextConfig = require('@weareinreach/eslint-config/next')
const i18nextPlugin = require('eslint-plugin-i18next')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...nextConfig,
	{
		ignores: ['webpack-stats.json', '**/*.spec.ts'],
	},
	{
		plugins: { i18next: i18nextPlugin },
		rules: {
			'i18next/no-literal-string': 'warn',
		},
		settings: {
			'i18next/no-literal-string': {
				exclude: ['I18n'],
			},
			next: {
				rootDir: 'apps/app/',
			},
		},
	},
	{
		files: ['**/*.d.ts'],
		rules: {
			'import/no-unused-modules': 'off',
		},
	},
]
