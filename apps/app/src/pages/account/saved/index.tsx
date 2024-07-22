import { Button, Card, Center, Divider, Grid, Loader, Overlay, Stack, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import { Integer } from 'type-fest'

import { getServerSession } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const QuickPromotionModal = dynamic(() =>
	import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal)
)

const formatDate = (dateString: Date) => {
	const date = new Date(dateString)
	const daySuffix = (d: number) => {
		if (d > 3 && d < 21) return 'th'
		switch (d % 10) {
			case 1:
				return 'st'
			case 2:
				return 'nd'
			case 3:
				return 'rd'
			default:
				return 'th'
		}
	}
	const day = date.getDate()
	const dayWithSuffix = day + daySuffix(day)
	const formattedDate = `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.toLocaleDateString('en-US', { month: 'long' })} ${dayWithSuffix}, ${date.getFullYear()}`
	return formattedDate
}

const SavedLists = () => {
	const { t } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter()
	const { data: allSavedLists } = api.savedList.getAll.useQuery()
	const variants = useCustomVariant()
	const handleReturnHome = useCallback(() => router.replace('/'), [router])
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
				<QuickPromotionModal component='button' autoLaunch onClose={handleReturnHome} />
			</Overlay>
		)
	}

	return (
		<Grid.Col xs={12} sm={12}>
			<Stack>
				<Title order={1}>Saved</Title>
				<Text size='lg'>
					Your lists of saved resources are only visible to you and anyone you share them with.
				</Text>
				<Button variant='primaryLg' onClick={() => router.push('/account')} style={{ width: 'fit-content' }}>
					Create new list
				</Button>
				<Divider my='xl' />
				{allSavedLists?.map((list) => (
					<Link
						key={list.id}
						href={{ pathname: '/account/saved/[listId]', query: { listId: list.id } }}
						style={{ textDecoration: 'none' }}
					>
						<Card key={list.id}>
							<Stack>
								<Title order={2}>{list.name}</Title>
								<Text>
									Updated {formatDate(list.updatedAt)} &#8226;{' '}
									{list._count.organizations + list._count.services} resources
								</Text>
							</Stack>
						</Card>
					</Link>
				))}
			</Stack>
		</Grid.Col>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await getServerSession({ req, res })

	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common', 'attribute'])),
		},
	}
}
export default SavedLists
