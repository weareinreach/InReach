/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['import'],
	extends: ['./base.js', 'plugin:import/typescript', 'plugin:@typescript-eslint/recommended'],
	// parser: '@typescript-eslint/parser',
	rules: {},
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
