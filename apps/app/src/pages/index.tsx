import { useTranslation } from 'next-i18next'

import type { NextPage } from 'next'
import Head from 'next/head'

import { Button } from '@weareinreach/ui/mantine/core'

const Home: NextPage = () => {
	const { t } = useTranslation('common')
	return (
		<>
			<Head>
				<title>{t('inreach')}</title>
			</Head>

			<p>{t('helloWorld')}</p>
			<Button>{t('iAmAButton')}</Button>
		</>
	)
}

export default Home
