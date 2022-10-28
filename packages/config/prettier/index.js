/**
 * @template {import('@types/prettier').RequiredOptions} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/prettier').RequiredOptions}}
 */

const config = {
	plugins: [...require('./plugins')],
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
		'^@(inreach)/(.*)$',
		'^react/(.*)$|^react$',
		'^@mantine/(.*)$',
		'^~/(.*)$',
		'^[./]',
		'<THIRD_PARTY_MODULES>',
	],
	overrides: [
		{
			files: '*.json',
			options: {
				singleQuote: false,
			},
		},
	],
}

module.exports = config
