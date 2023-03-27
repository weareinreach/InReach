import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'

export const PageLoadProgress = () => {
	const router = useRouter()
	const { t } = useTranslation('common')

	useEffect(() => {
		const handleStart = (url: string) => url !== router.asPath && nprogress.start()
		const handleComplete = () => nprogress.complete()

		router.events.on('routeChangeStart', handleStart)
		router.events.on('routeChangeComplete', handleComplete)
		router.events.on('routeChangeError', handleComplete)

		return () => {
			router.events.off('routeChangeStart', handleStart)
			router.events.off('routeChangeComplete', handleComplete)
			router.events.off('routeChangeError', handleComplete)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.asPath])

	return <NavigationProgress autoReset={true} progressLabel={t('loading-page') as string} />
}
