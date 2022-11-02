module.exports = {
	extends: ['@inreach/eslint-config'],
	overrides: [
		{
			files: ['./zod-schemas/*/ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
			},
		},
	],
}
