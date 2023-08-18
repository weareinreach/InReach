import { Container, rem, Stack, Text, Title } from '@mantine/core'
import { type GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'

import { getServerSideTranslations } from '~app/utils/i18n'

const Forbidden = () => {
	const { t } = useTranslation('common')

	return (
		<Container>
			<Stack
				m={{ base: `${rem(48)} ${rem(0)}`, xs: `${rem(80)} ${rem(0)}`, sm: `${rem(100)} ${rem(0)}` }}
				align='center'
				spacing={32}
			>
				<Stack spacing={0} align='center'>
					{/* eslint-disable-next-line i18next/no-literal-string */}
					<Title order={1}>⛔️</Title>
					<Title order={1}>{t('errors.403-title')}</Title>
				</Stack>
				<Text ta='center'>{t('errors.403-body')}</Text>
			</Stack>
		</Container>
	)
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await getServerSideTranslations(locale, ['common'])),
		},
		revalidate: 60 * 60 * 24 * 7,
	}
}

export default Forbidden
