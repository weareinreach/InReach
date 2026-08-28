const nextConfig = require('@weareinreach/eslint-config/next')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...nextConfig,
	{
		settings: {
			next: {
				rootDir: 'apps/web/',
			},
		},
	},
	{
		files: ['**/*.spec.ts', '**/*.d.ts'],
		rules: {
			'import-x/no-unused-modules': 'off',
		},
	},
]
