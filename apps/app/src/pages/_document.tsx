import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import NextDocument, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

import i18nextConfig from '../../next-i18next.config.mjs'

export default class Document extends NextDocument {
	render() {
		const currentLocale = this.props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale
		return (
			<Html lang={currentLocale} {...mantineHtmlProps}>
				<Head>
					<ColorSchemeScript defaultColorScheme='light' />
					{
						// eslint-disable-next-line node/no-process-env
						(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
							<Script
								data-project-id='80bkuIz3fVjteVEQL6H3mzOWfyTGfUJwJQ8Y4oxw'
								src='https://snippet.meticulous.ai/v1/meticulous.js'
							/>
						)
					}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
