module.exports = {
	extends: ['@weareinreach/eslint-config'],
	overrides: [
		{
			files: ['./zod-schemas/*/ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 'error',
			},
		},
	],
}
