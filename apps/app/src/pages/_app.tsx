import { Space } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { type NextPage } from 'next'
import { type AppProps, type NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { type Session } from 'next-auth'
import { appWithTranslation } from 'next-i18next'
import { DefaultSeo, type DefaultSeoProps } from 'next-seo'
import { GoogleAnalytics } from 'nextjs-google-analytics'

import { appEvent } from '@weareinreach/analytics/events'
import { PageLoadProgress } from '@weareinreach/ui/components/core/PageLoadProgress'
import { Footer } from '@weareinreach/ui/components/sections/Footer'
import { Navbar } from '@weareinreach/ui/components/sections/Navbar'
import { useScreenSize } from '@weareinreach/ui/hooks/useScreenSize'
import { BodyGrid } from '@weareinreach/ui/layouts/BodyGrid'
import { Providers } from '~app/providers'
import { api } from '~app/utils/api'

import nextI18nConfig from '../../next-i18next.config.mjs'

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

export function reportWebVitals(stats: NextWebVitalsMetric) {
	appEvent.webVitals(stats)
}

const MyApp = (appProps: AppPropsWithGridSwitch) => {
	const {
		Component,
		pageProps: { session, ...pageProps },
	} = appProps

	const router = useRouter()

	const { isMobile, isTablet } = useScreenSize()

	const autoResetState = Component.autoResetState ? { key: router.asPath } : {}

	const PageContent = () =>
		Component.omitGrid ? (
			<Component {...autoResetState} {...pageProps} />
		) : (
			<BodyGrid>
				<Component {...autoResetState} {...pageProps} />
			</BodyGrid>
		)

	return (
		<>
			<Head>
				<meta name='viewport' content='initial-scale=1, width=device-width, viewport-fit=cover'></meta>
			</Head>
			<Providers session={session}>
				<DefaultSeo {...defaultSEO} />
				<GoogleAnalytics trackPageViews defaultConsent='denied' />
				<PageLoadProgress />
				<Navbar />
				<PageContent />
				{(isMobile || isTablet) && <Space h={80} />}
				<Footer />
				<Notifications transitionDuration={500} />
				<ReactQueryDevtools initialIsOpen={false} toggleButtonProps={{ style: { zIndex: 99998 } }} />
				<Analytics />
			</Providers>
		</>
	)
}

export default api.withTRPC(appWithTranslation(MyApp, nextI18nConfig))

export type NextPageWithoutGrid<P = unknown, IP = P> = NextPage<P, IP> & {
	omitGrid?: boolean
	autoResetState?: boolean
}
type AppPropsWithGridSwitch = AppProps<{ session: Session }> & { Component: NextPageWithoutGrid }
