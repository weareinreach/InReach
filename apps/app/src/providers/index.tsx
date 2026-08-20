import { MantineProvider } from '@mantine/core'
import dynamic from 'next/dynamic'
import { Work_Sans } from 'next/font/google'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next/pages'
import { type ComponentPropsWithoutRef, useEffect, useMemo } from 'react'
import { ConsentBanner, type ConsentOptions, ConsentProvider } from 'react-hook-consent'

import { consentEvent } from '@weareinreach/analytics/events'
import { EditModeProvider } from '@weareinreach/ui/providers/EditMode'
import { GoogleMapsProvider } from '@weareinreach/ui/providers/GoogleMaps'
import { SearchStateProvider } from '@weareinreach/ui/providers/SearchState'
import { appTheme } from '@weareinreach/ui/theme'
import 'react-hook-consent/dist/styles/style.css'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrivacyStatementModal = dynamic<any>(() => import('@weareinreach/ui/modals/PrivacyStatement'), {
	ssr: false,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Link = dynamic<any>(() => import('@weareinreach/ui/components/core/Link'), { ssr: false })

export const Providers = ({ children, session }: ProviderProps) => {
	const { t } = useTranslation('common')

	// Global trigger for consent settings
	useEffect(() => {
		window.reopenConsent = () => {
			// Clear specific consent storage if known, or simply reload
			// to force the library to re-check storage and re-mount the banner
			window.location.reload()
		}
	}, [])

	const mantineTheme = useMemo(() => ({ ...appTheme, fontFamily: fontWorkSans.style.fontFamily }), [])

	const consentOptions: ConsentOptions = useMemo(
		() => ({
			services: [
				{ id: 'basic', name: t('cookie-consent.item-basic'), mandatory: true },
				{
					id: 'ga4',
					name: t('cookie-consent.item-ga4'),
					onAccept: () => {
						window.gtag?.('consent', 'update', { ad_storage: 'denied', analytics_storage: 'granted' })
						consentEvent.update('granted', 'ga4')
					},
					onDeny: () => {
						window.gtag?.('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied' })
						consentEvent.update('denied', 'ga4')
					},
					scripts: [
						{
							id: 'ga4-consent',
							code: `window.gtag?.('consent', 'update', { ad_storage: 'denied', analytics_storage: 'granted' });`,
						},
					],
				},
			],
			theme: 'light',
		}),
		[t]
	)

	const consentBannerSettings: ConsentBannerOpts = useMemo(
		() => ({
			settings: {
				modal: {
					title: t('cookie-consent.modal-title'),
					approve: { label: t('cookie-consent.approve-selected') },
					approveAll: { label: t('cookie-consent.approve-all') },
					decline: { label: t('words.decline') },
					description: (
						<Trans
							i18nKey='cookie-consent.body'
							components={{
								PrivacyLink: <PrivacyStatementModal component={Link} variant='inlineInvertedUtil1' />,
							}}
						/>
					),
				},
				label: t('words.customize'),
			},
			approve: { label: t('words.accept') },
			decline: { label: t('words.decline') },
		}),
		[t]
	)

	return (
		<MantineProvider theme={mantineTheme} defaultColorScheme='light'>
			<ConsentProvider options={consentOptions}>
				<SessionProvider session={session}>
					<EditModeProvider>
						<SearchStateProvider>
							<GoogleMapsProvider>
								{children}
								<ConsentBanner {...consentBannerSettings}>{t('cookie-consent.intro')}</ConsentBanner>
							</GoogleMapsProvider>
						</SearchStateProvider>
					</EditModeProvider>
				</SessionProvider>
			</ConsentProvider>
		</MantineProvider>
	)
}

type ProviderProps = { children: React.ReactNode; session: Session }
type ConsentBannerOpts = ComponentPropsWithoutRef<typeof ConsentBanner>

// Add type declaration for the global function
declare global {
	interface Window {
		reopenConsent: () => void
	}
}
