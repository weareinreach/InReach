/**
 * @template {import('@types/eslint').ESLint.ConfigData}
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"next",
		"turbo",
		"prettier",
		"plugin:@typescript-eslint/recommended",
	],
	plugins: ["prettier", "codegen", "@typescript-eslint"],
	rules: {
		"@next/next/no-html-link-for-pages": "off",
		"react/jsx-key": "off",
	},
};
