const storybookPlugin = require('eslint-plugin-storybook')
const tseslint = require('typescript-eslint')

const base = require('./base')

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(...base, ...storybookPlugin.configs['flat/recommended'], {
	rules: {
		'react/no-unescaped-entities': 'off',
	},
})

module.exports = config
