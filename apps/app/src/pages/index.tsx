import { type GetServerSidePropsContext, type NextPage } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'

import { getServerSideTranslations } from '~app/utils/i18n'

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
		...(await getServerSideTranslations(locale as string, ['common'])),
	},
})

export default Home
