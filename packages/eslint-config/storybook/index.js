/* eslint-disable import/no-unused-modules */

/** @type {import('@types/eslint').ESLint.ConfigData} */
const config = {
	plugins: ['storybook'],
	extends: ['../config', 'plugin:storybook/recommended'],
	rules: {},
}

module.exports = config
