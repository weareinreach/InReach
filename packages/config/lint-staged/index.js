const config = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
	// 'schema.prisma': ['prisma format'],
	'*.json': ['prettier --write'],
}

module.exports = config
