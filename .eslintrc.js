/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

module.exports = {
	extends: ['./packages/eslint-config/index.js'],
}
