import {
	Card,
	Center,
	createStyles,
	Divider,
	Grid,
	Group,
	Loader,
	Overlay,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { DateTime } from 'luxon'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

import { getServerSession } from '@weareinreach/auth'
import { ActionButtons } from '@weareinreach/ui/components/core/ActionButtons'
import { Button } from '@weareinreach/ui/components/core/Button'
import { Link } from '@weareinreach/ui/components/core/Link'
import { SavedResultLoading } from '@weareinreach/ui/components/core/Saved/SavedOrgResultCard'
import { CreateNewList } from '@weareinreach/ui/modals/CreateNewList'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const QuickPromotionModal = dynamic(() =>
	import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal)
)

const useStyles = createStyles((_theme) => ({
	lessRoundedButton: {
		borderRadius: '6px',
		width: 'fit-content',
	},
	deleteButton: {
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		padding: '8px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
}))

export const formatDate = (date: Date, locale = 'en') => {
	const dateTime = DateTime.fromJSDate(date).setLocale(locale)
	const formattedDate = dateTime.toLocaleString(DateTime.DATE_HUGE)
	return formattedDate
}

const SavedLists = () => {
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const { data: session, status } = useSession()
	const router = useRouter()
	const { data: allSavedLists, isLoading } = api.savedList.getAll.useQuery()
	const handleReturnHome = useCallback(() => router.replace('/'), [router])
	const apiUtils = api.useUtils()
	const deleteConfirmModalHandler = useDisclosure(false)

	const deleteMutation = api.savedList.delete.useMutation({
		onSuccess: () => {
			apiUtils.savedList.getAll.invalidate()
		},
	})

	const handleDelete = useCallback((id: string) => () => deleteMutation.mutate({ id }), [deleteMutation])

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
				<Title order={1}> {t('words.saved')} </Title>
				<Text size='lg'>{t('list.create-new-sub')}</Text>

				<CreateNewList component={Button} className={classes.lessRoundedButton}>
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
												{t('list.updated', { date: formatDate(list.updatedAt) })} &#8226;{' '}
												{t('list.resourcesCount', {
													count: list._count?.organizations + list?._count?.services,
												})}
											</Text>
										</Link>
									</Stack>
									<ActionButtons.Delete
										onClick={handleDelete(list.id)}
										modalHandler={deleteConfirmModalHandler}
									/>
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
