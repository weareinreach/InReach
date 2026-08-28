const nextCoreWebVitals = require('eslint-config-next/core-web-vitals')
const tseslint = require('typescript-eslint')

const base = require('./base')

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(
	...base,
	...nextCoreWebVitals,
	{
		// Matches the `files` glob `eslint-config-next/core-web-vitals` itself uses to register
		// the `react`/`react-hooks`/`jsx-a11y` plugins - without it, these rules apply globally
		// (e.g. to `.cjs` files) where those plugins were never registered, and ESLint errors with
		// "could not find plugin" instead of just skipping the rule.
		files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
		rules: {
			'@next/next/no-html-link-for-pages': 'off',
			'react/jsx-key': 'off',
			'react/no-unescaped-entities': 'off',
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'next-i18next/serverSideTranslations',
							importNames: ['serverSideTranslations'],
							message: "Please import 'getServerSideTranslations' from '~app/utils/i18n'",
						},
					],
				},
			],
			// eslint-plugin-react-hooks v7 (bundled by eslint-config-next 16) ships the React
			// Compiler's diagnostics as error-level lint rules (`rules-of-hooks`/`exhaustive-deps`
			// predate v7 and are left at their normal severity). Adopting the compiler itself is a
			// separate, deliberate initiative - surface these as warnings for now rather than
			// blocking on a fresh, repo-wide render-correctness audit.
			'react-hooks/static-components': 'warn',
			'react-hooks/use-memo': 'warn',
			'react-hooks/void-use-memo': 'warn',
			'react-hooks/preserve-manual-memoization': 'warn',
			'react-hooks/immutability': 'warn',
			'react-hooks/globals': 'warn',
			'react-hooks/refs': 'warn',
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/error-boundaries': 'warn',
			'react-hooks/purity': 'warn',
			'react-hooks/set-state-in-render': 'warn',
			'react-hooks/config': 'warn',
			'react-hooks/gating': 'warn',
			// `navigator`/`localStorage` are browser globals used deliberately in this isomorphic
			// Next.js code, not references to Node's experimental globals of the same name.
			'node/no-unsupported-features/node-builtins': ['error', { ignores: ['navigator', 'localStorage'] }],
		},
	},
	{
		files: ['*/pages/**/*.tsx'],
		rules: {
			'import-x/prefer-default-export': ['error', { target: 'any' }],
		},
	}
)

module.exports = config
