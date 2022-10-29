import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

import { ServerStyles, createStylesServer } from '@inreach/ui/mantine/next'
import { appCache } from '@inreach/ui/theme'

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
