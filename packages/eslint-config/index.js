const importPlugin = require('eslint-plugin-import-x')
const tseslint = require('typescript-eslint')

const base = require('./base')

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(...base, {
	// `eslint-config-next` bundles the legacy `eslint-plugin-import` under the `import` key, so
	// base.js leaves that key unregistered to avoid a "Cannot redefine plugin" clash for Next
	// consumers - non-Next consumers (this file) need to register it themselves.
	plugins: {
		import: importPlugin,
	},
	rules: {
		'no-useless-catch': 'warn',
	},
})

module.exports = config
