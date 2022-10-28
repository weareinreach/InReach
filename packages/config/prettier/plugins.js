/* @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/31#issuecomment-1024722576 */
// const sortImports = require("@trivago/prettier-plugin-sort-imports");

const plugins = [
	// {
	// 	parsers: {
	// 		typescript: {
	// 			preprocess: sortImports.parsers.typescript.preprocess,
	// 		},
	// 	},
	// },
	'@trivago/prettier-plugin-sort-imports',
	'prettier-plugin-packagejson',
]

module.exports = plugins
