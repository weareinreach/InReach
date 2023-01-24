/* eslint-disable import/no-unused-modules */
/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['storybook'],
	extends: ['./base.js', 'plugin:storybook/recommended'],
}

module.exports = config
