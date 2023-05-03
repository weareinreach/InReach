/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	plugins: ['import'],
	extends: ['./base.js', 'eslint:recommended'],
	rules: {
		'no-useless-catch': 'warn',
	},
}
module.exports = config
