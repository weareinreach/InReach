/* eslint-disable import/no-unused-modules */
/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['codegen', 'turbo', 'node', '@tanstack/query'],
	extends: [
		'plugin:turbo/recommended',
		'plugin:@tanstack/eslint-plugin-query/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	rules: {
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
			},
		],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: '^_',
				args: 'none',
				ignoreRestSiblings: true,
			},
		],
		'no-duplicate-imports': 'off',
		'node/no-process-env': 'warn',
		'codegen/codegen': 'error',
		'react/jsx-key': 'off',
		'react/no-unescaped-entities': ['off'],
		'turbo/no-undeclared-env-vars': 'warn',
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-absolute-path': 'error',
		'import/no-duplicates': 'error',
		'import/no-empty-named-blocks': 'error',
		'import/no-extraneous-dependencies': 'error',
		'import/no-unused-modules': 'off',
		'import/no-useless-path-segments': 'error',
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
		'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
		'import/order': [
			'warn',
			{
				groups: ['external', 'builtin', 'internal', ['index', 'sibling', 'parent'], 'object', 'type'],
				distinctGroup: false,
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					orderImportKind: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'import/no-self-import': 'error',
		// 'import/no-cycle': 'error',
		'no-restricted-imports': [
			'error',
			{
				paths: [
					{
						name: 'react-i18next',
						importNames: ['useTranslation', 'Trans', 'Translation'],
						message: "Please import from 'next-i18next'",
					},
				],
			},
		],
		'require-await': 'off',
		'@typescript-eslint/require-await': 'error',
		'no-return-await': 'off',
		'@typescript-eslint/return-await': 'error',
	},
	overrides: [
		{
			files: ['**/index.tsx?'],
			rules: {
				'import/no-unused-modules': 0,
			},
		},
		{
			files: ['./**/*.js'],
			parserOptions: { project: null },
			rules: {
				'@typescript-eslint/require-await': 'off',
				'@typescript-eslint/return-await': 'off',
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json', './tsconfig.json'],
	},
	ignorePatterns: ['!.*', '**/node_modules/**', 'dist/', '.next/'],
	settings: {
		'import/extensions': ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.mts', '.tsx'],
		'import/resolver': {
			node: true,
			typescript: {
				alwaysTryTypes: true,
			},
		},
		'import/cache': {
			lifetime: 10,
		},
		'import/internal-regex': '^(?:(?:@weareinreach\\/)|(?:~\\w*\\/)).*',
	},
	env: {
		node: true,
		browser: true,
	},
}
module.exports = config
