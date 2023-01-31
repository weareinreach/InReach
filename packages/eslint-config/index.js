/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['import'],
	extends: [
		'./base.js',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'eslint:recommended',
	],
	// parser: '@typescript-eslint/parser',
	rules: {
		'no-unused-vars': 1,
	},
	overrides: [
		{
			files: ['**/*.ts?(x)'],
			// plugins: ['@typescript-eslint'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: 'tsconfig.json',
			},
			// 	extends: [
			// 		'plugin:@typescript-eslint/recommended',
			// 		// 'plugin:@typescript-eslint/recommended-requiring-type-checking',
			// 	],
		},
	],
}
module.exports = config
