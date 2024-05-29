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
import { ConditionalReactQueryDevtool } from '~app/utils/RQDevtool'

import nextI18nConfig from '../../next-i18next.config.mjs'

const DonateModal = dynamic(() =>
	import('@weareinreach/ui/components/core/Donate').then((mod) => mod.DonateModal)
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

const PageContent = ({ Component, pageProps }: AppPropsWithGridSwitch) => {
	const router = useRouter()
	const autoResetState = Component.autoResetState ? { key: router.asPath } : {}
	return Component.omitGrid ? (
		<Component {...autoResetState} {...pageProps} />
	) : (
		<BodyGrid>
			<Component {...autoResetState} {...pageProps} />
		</BodyGrid>
	)
}

const MyApp = (appProps: AppPropsWithGridSwitch) => {
	const {
		pageProps: { session },
	} = appProps
	const { isMobile, isTablet } = useScreenSize()

	return (
		<>
			<Head>
				<meta name='viewport' content='initial-scale=1, width=device-width, viewport-fit=cover'></meta>
			</Head>
			<Providers session={session}>
				<DefaultSeo {...defaultSEO} />
				<GoogleAnalytics trackPageViews defaultConsent='granted' />
				{/* <Script id='gtm_conversion'>
					{`
					if (window.gtag) {
						gtag?.('config','G-RL8CR7T4EP')
					}
					`}
				</Script> */}
				<PageLoadProgress />
				<Navbar />
				<PageContent {...appProps} />
				{(isMobile || isTablet) && <Space h={80} />}
				<Footer />
				<Notifications transitionDuration={500} />
				<ConditionalReactQueryDevtool />
				<Analytics />
				<SpeedInsights />
				<DonateModal />
			</Providers>
		</>
	)
}

export default api.withTRPC(appWithTranslation(MyApp, nextI18nConfig))

export type NextPageWithOptions<Props = unknown, InitialProps = Props> = NextPage<Props, InitialProps> & {
	omitGrid?: boolean
	autoResetState?: boolean
}
type AppPropsWithGridSwitch = AppProps<{ session: Session }> & { Component: NextPageWithOptions }
