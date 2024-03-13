import '../../lib/wdyr'

import { Space } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { type NextPage } from 'next'
import { type AppProps, type NextWebVitalsMetric } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { type Session } from 'next-auth'
import { appWithTranslation, type UserConfig } from 'next-i18next'
import { DefaultSeo, type DefaultSeoProps } from 'next-seo'
import { GoogleAnalytics } from 'nextjs-google-analytics'

import { appEvent } from '@weareinreach/analytics/events'
import { isLocalDev } from '@weareinreach/env/checks'
import { PageLoadProgress } from '@weareinreach/ui/components/core/PageLoadProgress'
import { Footer } from '@weareinreach/ui/components/sections/Footer'
import { Navbar } from '@weareinreach/ui/components/sections/Navbar'
import { useScreenSize } from '@weareinreach/ui/hooks/useScreenSize'
import { BodyGrid } from '@weareinreach/ui/layouts/BodyGrid'
import { Providers } from '~app/providers'
import { api } from '~app/utils/api'

import nextI18nConfig from '../../next-i18next.config.mjs'
// import { Donate, DonateModal } from '@weareinreach/ui/components/core/Donate'
const DonateModal = dynamic(() =>
	import('@weareinreach/ui/components/core/Donate').then((mod) => mod.DonateModal)
)

const ReactQueryDevtools = dynamic(
	() => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
	{ ssr: false }
)

const defaultSEO = {
	titleTemplate: '%s | InReach',
	defaultTitle: 'InReach',
	additionalLinkTags: [
		{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32' },
		{ rel: 'icon', href: '/favicon-96x96.png', sizes: '96x96' },
		{ rel: 'apple-touch-icon', href: '/apple-icon-120x120.png', sizes: '120x120' },
		{ rel: 'apple-touch-icon', href: '/apple-icon-180x180.png', sizes: '180x180' },
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
				<GoogleAnalytics trackPageViews defaultConsent='granted' />
				<PageLoadProgress />
				<Navbar />
				<PageContent />
				{(isMobile || isTablet) && <Space h={80} />}
				<Footer />
				<Notifications transitionDuration={500} />
				{isLocalDev && (
					<ReactQueryDevtools initialIsOpen={false} toggleButtonProps={{ style: { zIndex: 99998 } }} />
				)}
				<Analytics />
				<SpeedInsights />
				<DonateModal />
			</Providers>
		</>
	)
}

const emptyInitialI18NextConfig: UserConfig = {
	i18n: {
		defaultLocale: nextI18nConfig.i18n.defaultLocale,
		locales: nextI18nConfig.i18n.locales,
	},
}

export default api.withTRPC(appWithTranslation(MyApp, emptyInitialI18NextConfig))

export type NextPageWithOptions<Props = unknown, InitialProps = Props> = NextPage<Props, InitialProps> & {
	omitGrid?: boolean
	autoResetState?: boolean
}
type AppPropsWithGridSwitch = AppProps<{ session: Session }> & { Component: NextPageWithOptions }
