import { Inter } from '@next/font/google'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import { GetServerSidePropsContext } from 'next'
import type { AppProps } from 'next/app'

import { AppLayout } from '@weareinreach/ui/layout'
import { MantineProvider } from '@weareinreach/ui/mantine/core'
import { ModalsProvider } from '@weareinreach/ui/mantine/modals'
import { NotificationsProvider } from '@weareinreach/ui/mantine/notifications'
import { appCache, appTheme } from '@weareinreach/ui/theme'

import { default as navItems } from '~/data/nav.json'
import { trpc } from '~/utils/trpc'

const fontInter = Inter({ subsets: ['latin'] })

const MyApp = (appProps: AppProps<{ session: Session }>) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = appProps
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={{ ...appTheme, fontFamily: fontInter.style.fontFamily }}
			emotionCache={appCache}
		>
			<SessionProvider session={session}>
				<NotificationsProvider>
					<ModalsProvider>
						<AppLayout navItems={navItems} footerLinks={navItems}>
							<Component {...pageProps} />
						</AppLayout>
					</ModalsProvider>
				</NotificationsProvider>
			</SessionProvider>
		</MantineProvider>
	)
}

export default trpc.withTRPC(appWithTranslation(MyApp))
