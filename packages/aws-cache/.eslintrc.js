/* eslint-disable import/no-unused-modules */
module.exports = {
	extends: ['@weareinreach/eslint-config'],
	rules: {
		'turbo/no-undeclared-env-vars': 0,
	},
	root: true,
	overrides: [
		{
			files: ['**/*.ts?(x)'],

			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
	],
}
