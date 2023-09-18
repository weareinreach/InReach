/** @type {import('eslint').ESLint.ConfigData} */
const config = {
	extends: ['./base.js', 'next/core-web-vitals'],
	rules: {
		'@next/next/no-html-link-for-pages': 'off',
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
	},
	parserOptions: {
		babelOptions: {
			presets: [require.resolve('next/babel')],
		},
	},
	overrides: [
		{
			files: ['*/pages/**/*.tsx'],
			rules: {
				'import/prefer-default-export': ['error', { target: 'any' }],
			},
		},
	],
}

module.exports = config
