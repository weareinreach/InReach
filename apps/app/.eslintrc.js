/* eslint-disable import/no-unused-modules */
module.exports = {
	plugins: ['i18next'],
	extends: ['@weareinreach/eslint-config/next'],
	rules: { 'i18next/no-literal-string': 1 },
	root: true,
	settings: {
		'i18next/no-literal-string': {
			exclude: ['I18n'],
		},
		next: {
			rootDir: 'apps/app/',
		},
	},
	overrides: [
		{
			files: ['**/*.ts?(x)'],

			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		{
			files: ['**/*.spec.ts', '**/*.d.ts'],
			rules: {
				'import/no-unused-modules': 0,
			},
		},
	],
}
