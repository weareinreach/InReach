/* eslint-disable import/no-unused-modules */
/**
 * @template {import('@types/prettier').RequiredOptions} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/prettier').RequiredOptions}}
 */

/** @type {import('@types/prettier').RequiredOptions} */
const config = {
	plugins: ['prettier-plugin-packagejson', 'prettier-plugin-jsdoc', 'prettier-plugin-prisma'],
	printWidth: 110,
	tabWidth: 2,
	useTabs: true,
	semi: false,
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: true,
	trailingComma: 'es5',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'lf',
	overrides: [
		{
			files: '*.json',
			options: {
				singleQuote: false,
			},
		},
		{
			files: '*.{ts,tsx}',
			options: {
				tsdoc: true,
			},
		},
		{
			files: '*.{yml,yaml}',
			options: {
				useTabs: false,
			},
		},
	],
}

module.exports = config
