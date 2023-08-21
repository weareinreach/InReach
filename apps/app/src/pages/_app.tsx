import 'core-js/features/array/at'

import { Space } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { type NextPage } from 'next'
import { type AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { type Session } from 'next-auth'
import { appWithTranslation } from 'next-i18next'
import { DefaultSeo, type DefaultSeoProps } from 'next-seo'

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
		{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32' },
		{ rel: 'icon', href: '/favicon-96x96.png', sizes: '96x96' },
		{ rel: 'apple-touch-icon', href: '/apple-icon-120x120.png', sizes: '120x120' },
		{ rel: 'apple-touch-icon', href: '/apple-icon-180x180.png', sizes: '180x180' },
	],
} satisfies DefaultSeoProps

const MyApp = (appProps: AppPropsWithPageOptions) => {
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
			<DefaultSeo {...defaultSEO} />
			<Providers session={session}>
				<PageLoadProgress />
				<Navbar />
				<PageContent />
				{(isMobile || isTablet) && <Space h={80} />}
				<Footer />
				<Notifications transitionDuration={500} />
				<ReactQueryDevtools initialIsOpen={false} toggleButtonProps={{ style: { zIndex: 99998 } }} />
			</Providers>
			<Analytics />
		</>
	)
}

export default api.withTRPC(appWithTranslation(MyApp, nextI18nConfig))

export type NextPageWithOptions<Props = unknown, InitialProps = Props> = NextPage<Props, InitialProps> & {
	omitGrid?: boolean
	autoResetState?: boolean
}
type AppPropsWithPageOptions = AppProps<{ session: Session }> & { Component: NextPageWithOptions }
