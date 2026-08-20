const storybookPlugin = require('eslint-plugin-storybook')

const nextConfig = require('@weareinreach/eslint-config/next')
const storybookConfig = require('@weareinreach/eslint-config/storybook')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...storybookConfig,
	...nextConfig,
	...storybookPlugin.configs['flat/recommended'],
	{
		ignores: ['storybook-static/**'],
	},
	{
		files: ['**/*.stories.*'],
		rules: {
			'node/no-process-env': 'off',
		},
	},
]
