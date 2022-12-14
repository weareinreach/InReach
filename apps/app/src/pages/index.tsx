import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
	const { t } = useTranslation('common')
	return (
		<>
			<Head>
				<title>{t('inreach')}</title>
			</Head>
		</>
	)
}

export const getServerSideProps = async ({ locale }: GetServerSidePropsContext) => ({
	props: {
		...(await serverSideTranslations(locale as string, ['common'])),
	},
})

export default Home
