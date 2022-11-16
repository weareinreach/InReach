const runPrettier = 'prettier --write --cache --cache-strategy metadata'
const runEslint = 'eslint --fix --max-warnings=-1 --cache'
const runPrismaFormat = (files) => files.map((file) => `prisma format --schema ${file}`)

const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': [runEslint, runPrettier],
	'*.prisma': runPrismaFormat,
	'*.json': [runPrettier],
	'*.prisma': [runPrettier],
	'*.html': [runPrettier],
	'*.{css,scss}': [runPrettier],
	'*.{yaml,yml}': [runPrettier],
	'*.md': [runPrettier],
}

module.exports = config
