/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	plugins: ['prettier', 'codegen', 'turbo'],
	extends: ['prettier', 'plugin:turbo/recommended', 'next/core-web-vitals'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
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
	settings: {
		next: {
			rootDir: ['apps/*/'],
		},
	},
	overrides: [
		{
			files: ['**/*.ts?(x)'],
			plugins: ['@typescript-eslint'],
			parser: '@typescript-eslint/parser',
			extends: ['plugin:@typescript-eslint/recommended'],
		},
	],
}

module.exports = config
