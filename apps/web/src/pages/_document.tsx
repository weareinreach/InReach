import { ServerStyleSheetDocument } from 'next-sanity/studio'

import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

import { ServerStyles, createStylesServer } from '@inreach/ui/mantine/next'
import { webCache } from '@inreach/ui/theme'

const stylesServer = createStylesServer(webCache)
export default class _Document extends ServerStyleSheetDocument {
	static async getInitialProps(ctx: DocumentContext) {
		const originalRenderPage = ctx.renderPage
		ctx.renderPage = () =>
			originalRenderPage({
				enhanceApp: (App) => (props) => <App {...props} />,
			})

		const initialProps = await ServerStyleSheetDocument.getInitialProps(ctx)

		return {
			...initialProps,
			styles: [
				initialProps.styles,
				<ServerStyles html={initialProps.html} server={stylesServer} key='styles' />,
			],
		}
	}

	render() {
		return (
			<Html>
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
