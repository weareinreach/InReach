import type { AppProps } from 'next/app'
// import Head from 'next/head'
import Tina from '../../.tina/components/TinaDynamicProvider'
import { MantineProvider } from '@inreach/ui/mantine/core'
import { ModalsProvider } from '@inreach/ui/mantine/modals'
import { NotificationsProvider } from '@inreach/ui/mantine/notifications'
import { webTheme, webCache } from '@inreach/ui/theme'
import { WebLayout } from '@inreach/ui/layouts'

const MyApp = (appProps: AppProps) => {
	const { Component, pageProps } = appProps
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={webTheme}
			emotionCache={webCache}
		>
			<NotificationsProvider>
				<ModalsProvider>
					<Tina>
						<WebLayout>
							<Component {...pageProps} />
						</WebLayout>
					</Tina>
				</ModalsProvider>
			</NotificationsProvider>
		</MantineProvider>
	)
}

export default MyApp
