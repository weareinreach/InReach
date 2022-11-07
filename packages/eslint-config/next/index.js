/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	extends: ['../config', 'next/core-web-vitals'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
	},
	// settings: {
	// 	next: {
	// 		rootDir: ['apps/*/'],
	// 	},
	// },
}

module.exports = config
