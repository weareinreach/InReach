/* eslint-disable import/no-unused-modules */
/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	plugins: ['storybook'],
	extends: ['../config', 'plugin:storybook/recommended'],
	rules: {},
}

module.exports = config
