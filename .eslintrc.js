/* eslint-disable import/no-unused-modules */
/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

module.exports = {
	extends: ['./packages/eslint-config/index.js'],

	root: true,
	ignorePatterns: ['.vercel'],
	overrides: [
		{
			files: ['**/*.ts?(x)', '**/*.mts'],

			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		{
			files: ['./@types/**/*.ts'],
			rules: {
				'import/no-extraneous-dependencies': 0,
			},
		},
	],
}
