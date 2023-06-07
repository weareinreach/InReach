import { Center, Grid, Loader, Overlay, Stack, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { getServerSession } from '@weareinreach/auth'
import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { getServerSideTranslations } from '~app/utils/i18n'

const SavedLists = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter()
	if (status === 'loading') {
		return (
			<Center>
				<Loader />
			</Center>
		)
	}
	if (status === 'unauthenticated' || session === null) {
		return (
			<Overlay blur={2}>
				<QuickPromotionModal autoLaunch onClose={() => router.replace('/')} />
			</Overlay>
		)
	}

	return (
		<Grid.Col xs={12} sm={12}>
			<Stack h='100vh' align='flex-start' w='100%'>
				<Title order={2}>{t('words.saved')}</Title>
				<Stack spacing={0} align='center' justify='center' h='100%' w='100%'>
					<Title order={2}>🚧</Title>
					<Title order={2}>{t('words.coming-soon')}</Title>
				</Stack>
			</Stack>
		</Grid.Col>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await getServerSession({ req, res })

	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}
export default SavedLists
