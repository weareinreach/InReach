import { createStylesServer, ServerStyles } from '@mantine/next'
import Document, { type DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

import { appCache } from '@weareinreach/ui/theme'

import i18nextConfig from '../../next-i18next.config.mjs'

const stylesServer = createStylesServer(appCache)
export default class _Document extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx)

		return {
			...initialProps,
			styles: [
				initialProps.styles,
				<ServerStyles html={initialProps.html} server={stylesServer} key='styles' />,
			],
		}
	}

	render() {
		const currentLocale = this.props.__NEXT_DATA__.locale || i18nextConfig.i18n.defaultLocale
		return (
			<Html lang={currentLocale}>
				<Head>
					{
						// eslint-disable-next-line node/no-process-env
						(process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview') && (
							// eslint-disable-next-line @next/next/no-sync-scripts
							<script
								data-project-id='80bkuIz3fVjteVEQL6H3mzOWfyTGfUJwJQ8Y4oxw'
								src='https://snippet.meticulous.ai/v1/meticulous.js'
							/>
						)
					}
				</Head>
				<body>
					<Main />
					<NextScript />
					<Script
						src='https://stats.inreach.org/umami.js'
						data-website-id='f228c645-98f3-4928-9d7a-61f65082728b'
						data-domains='app.inreach.org'
					/>
				</body>
			</Html>
		)
	}
}
