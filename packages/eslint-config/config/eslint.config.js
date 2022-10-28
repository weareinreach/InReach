/**
 * @template {import('@types/eslint').ESLint.ConfigData} T
 * @param {T} config A generic parameter that flows through to the return type
 * @constraint {{import('@types/eslint').ESLint.ConfigData}}
 */

const config = {
	plugins: ["prettier", "codegen", "turbo"],
	extends: [
		"next",
		"next/core-web-vitals",
		"prettier",
		"plugin:turbo/recommended",
	],
	rules: {
		"@next/next/no-html-link-for-pages": "off",
		"react/jsx-key": "off",
		"codegen/codegen": "error",
	},
	ignorePatterns: ["**/node_modules/**"],
	settings: {
		next: {
			rootDir: ["apps/*/"],
		},
	},
	overrides: [
		{
			files: ["**/*.ts?(x)"],
			plugins: ["@typescript-eslint"],
			parser: "@typescript-eslint/parser",
			extends: ["plugin:@typescript-eslint/recommended"],
		},
	],
};

module.exports = config;
