import { Box, Card, Center, Divider, Grid, Group, Loader, Overlay, Stack, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { type MouseEvent, useCallback } from 'react'

import { getServerSession } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { useCustomVariant } from '@weareinreach/ui/hooks/useCustomVariant'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { SavedResultLoading } from '~ui/components/core/Saved/SavedOrgResultCard'
import { Icon } from '~ui/icon'
import { CreateNewList } from '~ui/modals'

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
	const { data: allSavedLists, isLoading, refetch } = api.savedList.getAll.useQuery()
	const handleReturnHome = useCallback(() => router.replace('/'), [router])

	const deleteMutation = api.savedList.delete.useMutation({
		onSuccess: () => {
			refetch()
		},
	})

	const handleDelete = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, id: string) => {
		e.stopPropagation()
		deleteMutation.mutate({ id })
	}

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
				<Title order={1}> {t('list.saved')} </Title>
				<Text size='lg'>{t('list.create-new-sub')}</Text>
				<CreateNewList
					style={{
						fontSize: '16px',
						fontWeight: 'normal',
						backgroundColor: 'black',
						color: 'white',
						borderRadius: '10px',
						padding: '12px 24px',
						textAlign: 'center',
						border: 'none',
						display: 'inline-block',
						width: 'max-content',
					}}
				>
					{t('list.create-new')}
				</CreateNewList>
				<Divider my='xl' />
				{isLoading ? (
					<Center>
						<SavedResultLoading />
					</Center>
				) : !allSavedLists || allSavedLists.length === 0 ? (
					<Text>{t('list.none-yet')}</Text>
				) : (
					allSavedLists?.map((list) => (
						<Card key={list.id}>
							<Stack spacing='sm'>
								<Group position='apart' align='center' style={{ width: '100%' }}>
									<Stack spacing='sm' style={{ flex: 1 }}>
										<Link
											href={{ pathname: '/account/saved/[listId]', query: { listId: list.id } }}
											style={{ textDecoration: 'none', color: 'inherit' }}
										>
											<Title order={2}>{list.name}</Title>
											<Text>
												{t('list.updated')} {formatDate(list.updatedAt)} &#8226;{' '}
												{list._count.organizations + list._count.services} {t('list.resources')}
											</Text>
										</Link>
									</Stack>
									<Group spacing='sm'>
										<Box
											component='button'
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												padding: '8px',
												display: 'inline-flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
											onClick={(e) => handleDelete(e, list.id)}
										>
											<Icon icon='carbon:trash-can' width='24' height='24' />
											<Text ml='xs'>{t('list.delete')}</Text>
										</Box>
									</Group>
								</Group>
							</Stack>
						</Card>
					))
				)}
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
