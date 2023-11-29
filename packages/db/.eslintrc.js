module.exports = {
	extends: ['@weareinreach/eslint-config'],

	root: true,
	ignorePatterns: ['datastore/', 'prisma/generated/', 'zod-schemas/'],
	overrides: [
		{
			files: ['./zod-schemas/*.ts', './prisma/data-migrations/**/*.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
			},
		},
		{
			files: ['**/*.ts?(x)'],

			// parserOptions: {
			// 	project: 'tsconfig.json',
			// 	tsconfigRootDir: __dirname,
			// },
		},
	],
}
