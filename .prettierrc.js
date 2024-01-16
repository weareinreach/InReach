/** @type {import('prettier').Config} */
const config = {
	plugins: [
		require.resolve('prettier-plugin-packagejson'),
		require.resolve('prettier-plugin-jsdoc'),
		require.resolve('prettier-plugin-prisma'),
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
	jsdocCommentLineStrategy: 'keep',
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
		{
			files: '.swcrc',
			options: {
				parser: 'json',
			},
		},
	],
}

module.exports = config
