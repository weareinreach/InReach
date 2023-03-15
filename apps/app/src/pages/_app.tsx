// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import { GetServerSidePropsContext } from 'next'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Navbar, Footer } from '@weareinreach/ui/components/sections'
import { BodyGrid } from '@weareinreach/ui/layouts/BodyGrid'
import { useModalProps } from '@weareinreach/ui/modals'
import { appCache, appTheme } from '@weareinreach/ui/theme'
import { NextPage } from 'next'
import { type AppProps } from 'next/app'
import { Work_Sans } from 'next/font/google'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

import { api } from '~app/utils/api'

import nextI18nConfig from '../../next-i18next.config.mjs'

const fontWorkSans = Work_Sans({ subsets: ['latin'] })

export type NextPageWithoutGrid<P = {}, IP = P> = NextPage<P, IP> & { omitGrid?: boolean }
type AppPropsWithGridSwitch = AppProps & { Component: NextPageWithoutGrid; session: Session }

const MyApp = (appProps: AppPropsWithGridSwitch) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = appProps

	const PageContent = Component.omitGrid ? (
		<Component {...pageProps} />
	) : (
		<BodyGrid>
			<Component {...pageProps} />
		</BodyGrid>
	)

	return (
		<SessionProvider session={session}>
			<MantineProvider
				withGlobalStyles
				withNormalizeCSS
				theme={{ ...appTheme, fontFamily: fontWorkSans.style.fontFamily }}
				emotionCache={appCache}
			>
				<ModalsProvider {...useModalProps()}>
					<Navbar />
					{PageContent}
					<Footer />
					<Notifications />
				</ModalsProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</MantineProvider>
		</SessionProvider>
	)
}

export default api.withTRPC(appWithTranslation(MyApp, nextI18nConfig))
