import { createStylesServer, ServerStyles } from '@mantine/next'
import NextDocument, { type DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

import { appCache } from '@weareinreach/ui/theme'

import i18nextConfig from '../../next-i18next.config.mjs'

const stylesServer = createStylesServer(appCache)
export default class Document extends NextDocument {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await NextDocument.getInitialProps(ctx)
		return {
			...initialProps,
			styles: [
				initialProps.styles,
				<ServerStyles html={initialProps.html} server={stylesServer} key='styles' />,
			],
		}
	}

	render() {
		const currentLocale = this.props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale
		return (
			<Html lang={currentLocale}>
				<Head>
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
