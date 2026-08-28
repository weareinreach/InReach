const baseConfig = require('@weareinreach/eslint-config')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
	...baseConfig,
	{ ignores: ['dist/**', '.aws-sam/**'] },
	{
		// This package's tsconfig only covers `./src/index.ts` - fall back to a default program
		// for root-level JS/CJS config files instead of erroring.
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.js', '*.cjs'],
				},
			},
		},
	},
]
