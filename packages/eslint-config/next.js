/* eslint-disable import/no-unused-modules */
/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	extends: ['./', 'next/core-web-vitals'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
	},
	parserOptions: {
		babelOptions: {
			presets: [require.resolve('next/babel')],
		},
	},
	// settings: {
	// 	next: {
	// 		rootDir: ['apps/*/'],
	// 	},
	// },
}

module.exports = config
