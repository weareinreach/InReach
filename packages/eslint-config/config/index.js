/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

module.exports = {
	plugins: ['prettier', 'codegen', 'turbo'],
	extends: ['prettier', 'plugin:turbo/recommended'],
	rules: {
		'react/jsx-key': 'off',
		'codegen/codegen': 'error',
		'react/no-unescaped-entities': [
			'off',
			// {
			// 	forbid: [
			// 		{
			// 			char: '"',
			// 			alternatives: ['&quot;'],
			// 		},
			// 		{
			// 			char: "'",
			// 			alternatives: ['&apos;'],
			// 		},
			// 		{
			// 			char: '>',
			// 			alternatives: ['&gt;'],
			// 		},
			// 		{
			// 			char: '}',
			// 			alternatives: ['&#125;'],
			// 		},
			// 	],
			// },
		],
	},
	ignorePatterns: ['**/node_modules/**'],
	overrides: [
		{
			files: ['**/*.ts?(x)'],
			plugins: ['@typescript-eslint'],
			parser: '@typescript-eslint/parser',
			extends: ['plugin:@typescript-eslint/recommended'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},

	env: {
		es6: true,
	},
}
