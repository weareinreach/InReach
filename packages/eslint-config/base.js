/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['codegen', 'turbo', 'node', /*'import',*/ '@tanstack/query'],
	extends: [
		'eslint:recommended',
		// disable turbo plugin until vercel/turbo#5355 is resolved
		// 'plugin:turbo/recommended',
		'plugin:@tanstack/eslint-plugin-query/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'prettier',
	],
	rules: {
		'@typescript-eslint/consistent-type-assertions': [
			'error',
			{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' },
		],
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				fixStyle: 'inline-type-imports',
				disallowTypeAnnotations: false,
			},
		],
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				varsIgnorePattern: '^_',
				args: 'after-used',
				ignoreRestSiblings: true,
				destructuredArrayIgnorePattern: '^_',
			},
		],
		'@typescript-eslint/no-empty-function': 'off',
		'no-duplicate-imports': 'off',
		'node/no-deprecated-api': 'error',
		'node/no-process-env': 'warn',
		'node/no-unsupported-features/es-builtins': 'error',
		'node/no-unsupported-features/es-syntax': 'error',
		'node/no-unsupported-features/node-builtins': 'error',
		'codegen/codegen': 'error',
		'react/jsx-key': 'off',
		'react/no-unescaped-entities': 'off',
		// 'turbo/no-undeclared-env-vars': 'warn',
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
		'@typescript-eslint/require-await': 'off',
		'no-return-await': 'off',
		'@typescript-eslint/return-await': 'off',
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
		EXPERIMENTAL_useProjectService: true,
		// project: [ './packages/*/tsconfig.json', './apps/*/tsconfig.json', './tsconfig.json' ],
		emitDecoratorMetadata: true,
		ecmaVersion: 2020,
	},
	ignorePatterns: ['!.*', 'node_modules', 'dist/', '.next/'],
	settings: {
		'import/cache': {
			lifetime: 60,
		},
		'import/extensions': ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.mts', '.tsx'],
		'import/internal-regex': '^(?:(?:@weareinreach\\/)|(?:~\\w*\\/)).*',
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx', '.mts'],
		},
		'import/resolver': {
			node: true,
			typescript: {
				alwaysTryTypes: true,
				project: ['./packages/*/tsconfig.json', './apps/*/tsconfig.json', './tsconfig.json'],
			},
		},
	},
	env: {
		node: true,
		browser: true,
	},
}
module.exports = config
