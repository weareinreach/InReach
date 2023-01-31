/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['codegen', 'turbo', 'prettier', 'node', '@tanstack/query'],
	extends: ['plugin:turbo/recommended', 'plugin:@tanstack/eslint-plugin-query/recommended', 'prettier'],
	rules: {
		'node/no-process-env': 'warn',
		'react/jsx-key': 'off',
		'codegen/codegen': 'error',
		'react/no-unescaped-entities': ['off'],
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-empty-named-blocks': 'error',
		'import/no-extraneous-dependencies': 'error',
		'import/no-unused-modules': ['warn', { missingExports: true }],
		'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
		'import/order': [
			'warn',
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
	},
	ignorePatterns: ['!.*', '**/node_modules/**', 'dist/', '.next/'],
	settings: {
		'import/extensions': ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.mts', '.tsx'],
	},
	env: {
		node: true,
	},
}
module.exports = config
