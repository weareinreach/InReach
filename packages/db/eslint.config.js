const baseConfig = require('@weareinreach/eslint-config')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...baseConfig,
	{
		ignores: [
			'datastore/**',
			'prisma/generated/**',
			'zod-schemas/**',
			'kysely-vercel/**',
			'**/___*.ts',
			'_queries/**',
		],
	},
	{
		files: ['zod-schemas/*.ts', 'prisma/data-migrations/**/*.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
	{
		// This package's tsconfig covers `.js`/`.mjs` but not `.cjs` (e.g. .lintstagedrc.cjs) -
		// fall back to a default program for those instead of erroring.
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.cjs'],
				},
			},
		},
	},
]
