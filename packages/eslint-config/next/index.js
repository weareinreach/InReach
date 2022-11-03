/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	plugins: ['i18next'],
	extends: ['../', 'next/core-web-vitals'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
		'i18next/no-literal-string': 1,
	},
	settings: {
		'i18next/no-literal-string': {
			exclude: ['I18n'],
		},
		next: {
			rootDir: ['apps/*/'],
		},
	},
}

module.exports = config
