/* eslint-disable import/no-unused-modules */
const runPrettier = 'prettier --cache --cache-strategy metadata --write'
const runEslint = 'eslint --cache --fix --max-warnings=-1'
// const runPrismaFormat = (files) => files.map((file) => `prisma format --schema ${file}`)

const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': [runEslint, runPrettier],
	'*.{json,prisma,html,css,scss,yaml,yml,md}': [runPrettier],
}

module.exports = config
