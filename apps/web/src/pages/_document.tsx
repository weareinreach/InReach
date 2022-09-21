import { createStylesServer, ServerStyles } from "@inreach/ui/mantine/next";
import Document, {
	Head,
	Html,
	Main,
	NextScript,
	DocumentContext,
} from "next/document";
import { webCache } from "@inreach/ui/theme";
import { ServerStyleSheetDocument } from "next-sanity/studio";

const stylesServer = createStylesServer(webCache);
export default class _Document extends ServerStyleSheetDocument {
	static async getInitialProps(ctx: DocumentContext) {
		const originalRenderPage = ctx.renderPage;
		ctx.renderPage = () =>
			originalRenderPage({
				enhanceApp: (App) => (props) => <App {...props} />,
			});

		const initialProps = await ServerStyleSheetDocument.getInitialProps(ctx);

		return {
			...initialProps,
			styles: [
				initialProps.styles,
				<ServerStyles
					html={initialProps.html}
					server={stylesServer}
					key="styles"
				/>,
			],
		};
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
		);
	}
}
