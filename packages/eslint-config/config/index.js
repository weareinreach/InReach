/* eslint-disable import/no-unused-modules */
/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

module.exports = {
	plugins: ['codegen', 'turbo', 'prettier', 'import'],
	extends: ['plugin:turbo/recommended', 'prettier', 'plugin:import/typescript'],
	rules: {
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-empty-named-blocks': 'error',
		'import/no-extraneous-dependencies': 'error',
		'import/no-unused-modules': ['warn', { missingExports: true }],
		'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
		'import/order': [
			'error',
			{
				groups: ['external', 'builtin', 'internal', ['index', 'sibling', 'parent'], 'object', 'type'],
				pathGroups: [
					{
						pattern: '@weareinreach/**',
						group: 'external',
						position: 'after',
					},
				],
				distinctGroup: false,
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
				},
			},
		],
		'react/jsx-key': 'off',
		'codegen/codegen': 'error',
		'react/no-unescaped-entities': ['off'],
	},
	ignorePatterns: ['!.*', '**/node_modules/**', 'dist', '.next'],
	settings: {
		'import/extensions': ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.mts', '.tsx'],
	},
	overrides: [
		{
			files: ['**/*.ts?(x)'],
			plugins: ['@typescript-eslint'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: 'tsconfig.json',
			},
			extends: [
				'plugin:@typescript-eslint/recommended',
				// 'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
		},
	],
	env: {
		es6: true,
	},
}
