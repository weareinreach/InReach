import type { AppProps } from 'next/app'
// import Head from 'next/head'
import { MantineProvider } from '@inreach/ui/mantine/core'
import { ModalsProvider } from '@inreach/ui/mantine/modals'
import { NotificationsProvider } from '@inreach/ui/mantine/notifications'
import { webTheme, webCache } from '@inreach/ui/theme'
import Tina from '../../.tina/components/TinaDynamicProvider'

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
						<Component {...pageProps} />
					</Tina>
				</ModalsProvider>
			</NotificationsProvider>
		</MantineProvider>
	)
}

export default MyApp
