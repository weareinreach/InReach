/* eslint-disable import/no-unused-modules */
module.exports = {
	extends: ['@weareinreach/eslint-config/next'],
	overrides: [
		{
			files: ['**/*.ts?(x)'],

			// parserOptions: {
			// 	project: 'tsconfig.json',
			// 	tsconfigRootDir: __dirname,
			// },
		},
	],
	root: true,
}
