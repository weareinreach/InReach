/* eslint-disable import/no-unused-modules */
module.exports = {
	overrides: [
		{
			files: ['**/*.ts?(x)'],

			// parserOptions: {
			// 	project: 'tsconfig.json',
			// 	tsconfigRootDir: __dirname,
			// },
		},
		{
			files: ['**/*.spec.ts', '**/*.d.ts'],
			rules: {
				'import/no-unused-modules': 0,
			},
		},
	],
	root: true,
	extends: ['@weareinreach/eslint-config/next'],
	settings: {
		next: {
			rootDir: 'apps/web/',
		},
	},
}
