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
	overrides: [
		{
			files: ['./**/*.stories.*'],
			rules: {
				'node/no-process-env': 'off',
			},
		},
	],
	root: true,
	ignorePatterns: ['storybook-static/'],
}
