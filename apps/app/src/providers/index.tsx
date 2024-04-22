'use client'
import { MantineProvider } from '@mantine/core'
// import dynamic, { type LoaderComponent } from 'next/dynamic'
import { /*Noto_Color_Emoji,*/ Work_Sans } from 'next/font/google'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
// import { Trans, useTranslation } from 'next-i18next'
import { useMemo } from 'react'
// import { type ConsentBanner, type ConsentOptions } from 'react-hook-consent'

import { EditModeProvider } from '@weareinreach/ui/providers/EditMode'
import { GoogleMapsProvider } from '@weareinreach/ui/providers/GoogleMaps'
import { SearchStateProvider } from '@weareinreach/ui/providers/SearchState'
import { appCache, appTheme } from '@weareinreach/ui/theme'
import 'react-hook-consent/dist/styles/style.css'

// const fallbackEmoji = Noto_Color_Emoji({ weight: '400', subsets: ['emoji'] })

const fontWorkSans = Work_Sans({
	subsets: ['latin-ext'],
	weight: ['400', '500', '600'],
	fallback: [
		'-apple-system',
		'BlinkMacSystemFont',
		'Segoe UI',
		'Roboto',
		'Helvetica',
		'Arial',
		'sans-serif',
		'Apple Color Emoji',
		'Noto Color Emoji',
		'Segoe UI Emoji',
	],
})

// const PrivacyStatementModal = dynamic(
// 	() =>
// 		import('@weareinreach/ui/modals/PrivacyStatement').then(
// 			(mod) => mod.PrivacyStatementModal
// 		) satisfies LoaderComponent
// )
// const Link = dynamic(() => import('@weareinreach/ui/components/core/Link').then((mod) => mod.Link))

export const Providers = ({ children, session }: ProviderProps) => {
	// const { t } = useTranslation('common')

	// const consentOptions: ConsentOptions = useMemo(
	// 	() => ({
	// 		services: [
	// 			{
	// 				id: 'basic',
	// 				name: t('cookie-consent.item-basic'),
	// 				mandatory: true,
	// 			},
	// 			{
	// 				id: 'ga4',
	// 				name: t('cookie-consent.item-ga4'),
	// 				scripts: [
	// 					{
	// 						id: 'ga4-consent',
	// 						code: `window.gtag && window.gtag('consent', 'update', {ad_storage: 'granted',	analytics_storage: 'granted'})`,
	// 					},
	// 				],
	// 			},
	// 		],
	// 		theme: 'light',
	// 	}),
	// 	[t]
	// )

	// const consentBannerSettings: ConsentBannerOpts = useMemo(
	// 	() => ({
	// 		settings: {
	// 			modal: {
	// 				title: t('cookie-consent.modal-title'),
	// 				approve: { label: t('cookie-consent.approve-selected') },
	// 				approveAll: { label: t('cookie-consent.approve-all') },
	// 				decline: { label: t('words.decline') },
	// 				description: (
	// 					<Trans
	// 						i18nKey='cookie-consent.body'
	// 						components={{
	// 							PrivacyLink: (
	// 								/* @ts-expect-error -> This is a dynamic component */
	// 								<PrivacyStatementModal component={Link} variant='inlineInvertedUtil1' />
	// 							),
	// 						}}
	// 					/>
	// 				),
	// 			},
	// 			label: t('words.customize'),
	// 		},
	// 		approve: { label: t('words.accept') },
	// 		decline: { label: t('words.decline') },
	// 	}),
	// 	[t]
	// )

	const mantineTheme = useMemo(() => ({ ...appTheme, fontFamily: fontWorkSans.style.fontFamily }), [])

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme} emotionCache={appCache}>
			{/* <ConsentProvider options={consentOptions}> */}
			<SessionProvider session={session}>
				<EditModeProvider>
					<SearchStateProvider>
						<GoogleMapsProvider>
							{children}
							{/* <ConsentBanner {...consentBannerSettings}>{t('cookie-consent.intro')}</ConsentBanner> */}
						</GoogleMapsProvider>
					</SearchStateProvider>
				</EditModeProvider>
			</SessionProvider>
			{/* </ConsentProvider> */}
		</MantineProvider>
	)
}

type ProviderProps = {
	children: React.ReactNode
	session: Session
}

// type ConsentBannerOpts = ComponentPropsWithoutRef<typeof ConsentBanner>
