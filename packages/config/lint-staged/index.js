const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
	// 'schema.prisma': ['prisma format'],
	'*.json': ['prettier --write'],
	'*.prisma': ['prettier --write'],
	'*.html': ['prettier --write'],
	'*.{css,scss}': ['prettier --write'],
	'*.{yaml,yml}': ['prettier --write'],
	'*.md': ['prettier --write'],
}

module.exports = config
