/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['storybook'],
	extends: ['./base.js', 'plugin:storybook/recommended'],
	rules: {
		'react/no-unescaped-entities': 'off',
	},
}

module.exports = config
