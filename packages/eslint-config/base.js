/* eslint-disable node/no-process-env */
const js = require('@eslint/js')
const tanstackQuery = require('@tanstack/eslint-plugin-query')
const { createTypeScriptImportResolver } = require('eslint-import-resolver-typescript')
const codegenPlugin = require('eslint-plugin-codegen')
const importPlugin = require('eslint-plugin-import-x')
const nodePlugin = require('eslint-plugin-n')
const turboPlugin = require('eslint-plugin-turbo')
const globals = require('globals')
const tseslint = require('typescript-eslint')

const path = require('node:path')

const tsconfigGlobs = [
	path.join(__dirname, '../*/tsconfig.json'),
	path.join(__dirname, '../../apps/*/tsconfig.json'),
	path.join(__dirname, '../../lambdas/*/tsconfig.json'),
	path.join(__dirname, '../../tsconfig.json'),
]

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	importPlugin.flatConfigs.typescript,
	...tanstackQuery.configs['flat/recommended'],
	{
		plugins: {
			codegen: codegenPlugin,
			node: nodePlugin,
			turbo: turboPlugin,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: Infinity,
				},
			},
		},
		settings: {
			// eslint-plugin-n only looks up the nearest package.json's `engines.node` field, which
			// stops at each workspace package (most don't declare one) rather than the monorepo
			// root - set the real minimum explicitly instead of letting it fall back to `>=16.0.0`.
			node: { version: '>=24.0.0' },
			'import-x/cache': { lifetime: 60 },
			'import-x/extensions': ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.mts', '.tsx'],
			'import-x/internal-regex': String.raw`^(?:(?:@weareinreach\/)|(?:~\w*\/)).*`,
			'import-x/resolver-next': [
				createTypeScriptImportResolver({ alwaysTryTypes: true, project: tsconfigGlobs }),
			],
		},
		rules: {
			// Allow `interface Foo extends Bar {}` - the standard shape for `declare module`
			// augmentation/declaration merging, which can't be expressed as a type alias.
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
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
			// Codebase makes deliberate use of `cond && cond && sideEffect()` as a statement.
			'@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
			'no-duplicate-imports': 'off',
			'node/no-deprecated-api': 'error',
			'node/no-process-env': 'warn',
			'node/no-unsupported-features/es-builtins': 'error',
			'node/no-unsupported-features/es-syntax': 'error',
			'node/no-unsupported-features/node-builtins': 'error',
			'codegen/codegen': 'error',
			// 'turbo/no-undeclared-env-vars': 'warn',
			'import-x/first': 'error',
			'import-x/newline-after-import': 'error',
			'import-x/no-absolute-path': 'error',
			'import-x/no-duplicates': 'error',
			'import-x/no-empty-named-blocks': 'error',
			'import-x/no-extraneous-dependencies': 'error',
			'import-x/no-unused-modules': 'off',
			'import-x/no-useless-path-segments': 'error',
			'sort-imports': [
				'error',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
				},
			],
			'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],
			'import-x/order': [
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
			'import-x/no-self-import': 'error',
			'import-x/no-cycle': [
				process.env.ESLINT_FULL ? 'error' : 'off',
				{
					ignoreExternal: true,
					maxDepth: 2,
				},
			],
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react-i18next',
							importNames: ['useTranslation', 'Trans', 'Translation'],
							message: "Please import from 'next-i18next'",
						},
						{
							name: 'nextjs-google-analytics',
							importNames: ['event'],
							message: "Define the event in '@weareinreach/analytics' and import from there",
						},
					],
				},
			],
			'require-await': 'off',
			'@typescript-eslint/require-await': 'off',
			'no-return-await': 'off',
			'@typescript-eslint/return-await': 'off',
			// Replaces `eslint-plugin-deprecation`, which has no ESLint 9+/flat-config support -
			// this rule was absorbed into typescript-eslint itself as of v8.
			'@typescript-eslint/no-deprecated': 'warn',
		},
	},
	{
		files: ['**/index.tsx?'],
		rules: {
			'import-x/no-unused-modules': 'off',
		},
	},
	{
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
		},
		rules: {
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/return-await': 'off',
			'@typescript-eslint/consistent-type-assertions': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-deprecated': 'off',
			// This whole repo's config layer (eslint.config.js, .lintstagedrc.js, etc.) is CJS.
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		// eslint-config-next's bundled parser also claims `.mts`/`.cts` (matching its own
		// `**/*.{js,jsx,mjs,ts,tsx,mts,cts}` glob), overriding the type-aware TS parser for
		// these one-off config files (e.g. vitest.config.mts) without forwarding project info.
		files: ['**/*.{mts,cts}'],
		rules: {
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/return-await': 'off',
			'@typescript-eslint/consistent-type-assertions': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-deprecated': 'off',
		},
	},
	{
		// `eslint .` walks every file with no extension filter of its own - without this, a bare
		// `.css`/`.module.css` file gets handed to `@typescript-eslint/parser` (via the type-aware
		// `projectService` set above, which has no `files` restriction) and fails with "extension is
		// non-standard", which in turn breaks the CI reporter's GitHub check-run upload entirely.
		ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/*.css'],
	}
)

module.exports = config
