/* eslint-disable import/no-unused-modules */
module.exports = {
	extends: ['@weareinreach/eslint-config/storybook', '@weareinreach/eslint-config/next'],
	// overrides: [
	// 	{
	// 		files: ['**/*.ts?(x)'],
	// 		parser: '@typescript-eslint/parser',

	// 		parserOptions: {
	// 			project: 'tsconfig.json',
	// 			tsconfigRootDir: __dirname,
	// 		},
	// 	},
	// ],
	root: true,
	ignorePatterns: ['storybook-static/'],
}
