/* eslint-disable import/no-unused-modules */
/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	extends: ['./base.js', 'next/core-web-vitals', 'prettier'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
	},
	parserOptions: {
		babelOptions: {
			presets: [require.resolve('next/babel')],
		},
	},
	overrides: [
		{
			files: ['*/pages/**/*.tsx'],
			rules: {
				'import/prefer-default-export': ['error', { target: 'any' }],
			},
		},
	],
	// settings: {
	// 	next: {
	// 		rootDir: ['apps/*/'],
	// 	},
	// },
}

module.exports = config
