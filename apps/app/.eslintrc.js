/* eslint-disable import/no-unused-modules */
module.exports = {
	plugins: ['i18next'],
	root: true,
	extends: ['@weareinreach/eslint-config/next'],
	rules: { 'i18next/no-literal-string': 1 },
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	settings: {
		'i18next/no-literal-string': {
			exclude: ['I18n'],
		},
		next: {
			rootDir: './',
		},
	},
}
