import { createStylesServer, ServerStyles } from '@inreach/ui/mantine/next'
import Document, {
	Head,
	Html,
	Main,
	NextScript,
	DocumentContext,
} from 'next/document'
import { webCache } from '@inreach/ui/theme'

const stylesServer = createStylesServer(webCache)
export default class _Document extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx)

		return {
			...initialProps,
			styles: [
				initialProps.styles,
				<ServerStyles
					html={initialProps.html}
					server={stylesServer}
					key='styles'
				/>,
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
