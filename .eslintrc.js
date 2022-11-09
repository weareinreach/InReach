module.exports = {
	root: true,
	// This tells ESLint to load the config from the package `eslint-config-custom`
	extends: ['@weareinreach/eslint-config'],
	settings: {
		next: {
			rootDir: ['apps/*/'],
		},
	},
}
