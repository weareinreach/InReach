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
import { DefaultSeo, DefaultSeoProps } from 'next-seo'

import { api } from '~app/utils/api'

import nextI18nConfig from '../../next-i18next.config.mjs'

const fontWorkSans = Work_Sans({ subsets: ['latin'] })

const defaultSEO = {
	titleTemplate: '%s | InReach',
	defaultTitle: 'InReach',
	additionalLinkTags: [
		{
			rel: 'icon',
			href: '/favicon-16x16.png',
			sizes: '16x16',
		},
		{
			rel: 'icon',
			href: '/favicon-32x32.png',
			sizes: '32x32',
		},
		{
			rel: 'icon',
			href: '/favicon-96x96.png',
			sizes: '96x96',
		},
		{
			rel: 'apple-touch-icon',
			href: '/apple-icon-120x120.png',
			sizes: '120x120',
		},
		{
			rel: 'apple-touch-icon',
			href: '/apple-icon-180x180.png',
			sizes: '180x180',
		},
	],
} satisfies DefaultSeoProps

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
			<DefaultSeo {...defaultSEO} />
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

export type NextPageWithoutGrid<P = {}, IP = P> = NextPage<P, IP> & { omitGrid?: boolean }
type AppPropsWithGridSwitch = AppProps & { Component: NextPageWithoutGrid; session: Session }
