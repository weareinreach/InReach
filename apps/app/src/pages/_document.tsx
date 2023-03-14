import { ServerStyles, createStylesServer } from '@mantine/next'
import { appCache } from '@weareinreach/ui/theme'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

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
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
