const runPrettier = 'prettier --cache --cache-strategy metadata --write'
const runEslint = 'eslint --cache --fix --max-warnings=-1'
const runPrismaFormat = (files) => files.map((file) => `prisma format --schema ${file}`)

const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': [runEslint, runPrettier],
	'*.json': [runPrettier],
	'*.prisma': [runPrettier],
	'*.html': [runPrettier],
	'*.{css,scss}': [runPrettier],
	'*.{yaml,yml}': [runPrettier],
	'*.md': [runPrettier],
}

module.exports = config
