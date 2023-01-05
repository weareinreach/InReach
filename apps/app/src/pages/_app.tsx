import { Work_Sans } from '@next/font/google'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import { GetServerSidePropsContext } from 'next'
import type { AppProps } from 'next/app'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'

import { AppLayout } from '@weareinreach/ui/layout'
import { appCache, appTheme } from '@weareinreach/ui/theme'

import { default as navItems } from '~/data/nav.json'
import { default as socialMediaLinks } from '~/data/socialMedia.json'
import { trpc } from '~/utils/trpc'

const fontWorkSans = Work_Sans({ subsets: ['latin'] })

const MyApp = (appProps: AppProps<{ session: Session }>) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = appProps
	return (
		<MantineProvider
			withGlobalStyles
			withNormalizeCSS
			theme={{ ...appTheme, fontFamily: fontWorkSans.style.fontFamily }}
			emotionCache={appCache}
		>
			<SessionProvider session={session}>
				<NotificationsProvider>
					<ModalsProvider>
						<AppLayout navItems={navItems} footerLinks={navItems} socialMedia={socialMediaLinks}>
							<Component {...pageProps} />
						</AppLayout>
					</ModalsProvider>
				</NotificationsProvider>
			</SessionProvider>
		</MantineProvider>
	)
}

export default trpc.withTRPC(appWithTranslation(MyApp))
