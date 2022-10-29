/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	plugins: ['storybook'],
	extends: ['plugin:storybook/recommended'],
	rules: {},
}

module.exports = config
