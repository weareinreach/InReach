/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['import'],
	extends: [
		'./base.js',
		'eslint:recommended',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	// parser: '@typescript-eslint/parser',
	rules: {
		'no-useless-catch': 'warn',
	},
	overrides: [
		{
			files: ['**/*.tsx?'],
			// plugins: ['@typescript-eslint'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: 'tsconfig.json',
			},
			rules: {},
			// 	extends: [
			// 		'plugin:@typescript-eslint/recommended',
			// 		// 'plugin:@typescript-eslint/recommended-requiring-type-checking',
			// 	],
		},
	],
}
module.exports = config
