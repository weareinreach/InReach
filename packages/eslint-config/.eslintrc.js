/* eslint-disable import/no-unused-modules */
module.exports = {
	extends: ['./index.js'],
	overrides: [
		{
			files: ['**/*.ts?(x)'],

			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
	],
	root: true,
}
