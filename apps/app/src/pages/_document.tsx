import { ServerStyles, createStylesServer } from '@mantine/next'
import { appCache } from '@weareinreach/ui/theme'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

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
					<Script
						src='https://stats.inreach.org/umami.js'
						data-website-id='f228c645-98f3-4928-9d7a-61f65082728b'
						data-domains='inreach.org'
					/>
					<script
						type='text/javascript'
						src='https://inreach.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/-raa8on/b/8/c95134bc67d3a521bb3f4331beb9b804/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=84c20f39'
						async
					></script>
				</body>
			</Html>
		)
	}
}
