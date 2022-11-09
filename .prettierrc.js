/**
 * @template {import('@types/prettier').RequiredOptions} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/prettier').RequiredOptions}}
 */
const path = require('path')

const config = {
	plugins: [
		'@trivago/prettier-plugin-sort-imports',
		'prettier-plugin-packagejson',
		'prettier-plugin-jsdoc',
		'prettier-plugin-prisma',
	],
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
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrder: [
		'<THIRD_PARTY_MODULES>',
		'^next/(.*)$|^next$',
		'^react/(.*)$|^react$',
		'^@mantine/(.*)$',
		'^@weareinreach/(.*)$',
		'^~/(.*)$',
		'^([./]).*',
	],
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
	],
}

module.exports = config
