import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

import type { AppProps } from 'next/app'

import { MantineProvider } from '@weareinreach/ui/mantine/core'
import { ModalsProvider } from '@weareinreach/ui/mantine/modals'
import { NotificationsProvider } from '@weareinreach/ui/mantine/notifications'
import { appCache, appTheme } from '@weareinreach/ui/theme'

import { trpc } from '~/utils/trpc'

const MyApp = (appProps: AppProps<{ session: Session }>) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = appProps
	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme} emotionCache={appCache}>
			<SessionProvider session={session}>
				<NotificationsProvider>
					<ModalsProvider>
						<Component {...pageProps} />
					</ModalsProvider>
				</NotificationsProvider>
			</SessionProvider>
		</MantineProvider>
	)
}

export default trpc.withTRPC(appWithTranslation(MyApp))
