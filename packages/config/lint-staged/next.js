/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unused-modules */
const path = require('path')

const buildEslintCommand = (filenames) =>
	`next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`

const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': [buildEslintCommand, 'prettier --write'],
	'schema.prisma': ['prisma format'],
	'*.json': ['prettier --write'],
}

module.exports = config
