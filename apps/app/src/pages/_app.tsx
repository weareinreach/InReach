// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import { GetServerSidePropsContext } from 'next'

import { MantineProvider, TypographyStylesProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'
import { Work_Sans } from '@next/font/google'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useModalProps } from '@weareinreach/ui/modals'
import { appCache, appTheme } from '@weareinreach/ui/theme'
import { type AppProps } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

import { api } from '~app/utils/api'

import nextI18nConfig from '../../next-i18next.config'

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
			<TypographyStylesProvider>
				<SessionProvider session={session}>
					<NotificationsProvider>
						<ModalsProvider modalProps={useModalProps()}>
							{/* <AppLayout navItems={navItems} footerLinks={navItems} socialMedia={socialMediaLinks}> */}
							<Component {...pageProps} />
							{/* </AppLayout> */}
						</ModalsProvider>
					</NotificationsProvider>
				</SessionProvider>
			</TypographyStylesProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</MantineProvider>
	)
}

export default api.withTRPC(appWithTranslation(MyApp, nextI18nConfig))
