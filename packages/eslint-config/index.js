/* eslint-disable import/no-unused-modules */

/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	extends: ['./base.js'],
	plugins: ['import'],
	rules: {
		'no-useless-catch': 'warn',
	},
}
module.exports = config
