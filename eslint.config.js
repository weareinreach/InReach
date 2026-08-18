const baseConfig = require('@weareinreach/eslint-config')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...baseConfig,
	{
		ignores: [
			'.vercel/**',
			'**/*.spec.ts',
			'lambdas/*/dist/**',
			'lambdas/*/.aws-sam/**',
			'apps/*/.next/**',
			'packages/ui/storybook-static/**',
			'packages/db/datastore/**',
			'packages/db/prisma/generated/**',
			'packages/db/zod-schemas/**',
			'packages/db/kysely-vercel/**',
		],
	},
	{
		files: ['@types/**/*.ts'],
		rules: {
			'import/no-extraneous-dependencies': 'off',
		},
	},
]
