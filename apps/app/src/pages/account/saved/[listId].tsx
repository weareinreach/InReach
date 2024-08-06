import { Center, Container, Group, Loader, Overlay, Stack, Tabs, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import { getServerSession } from '@weareinreach/auth'
import {
	SavedOrgResultCard,
	SavedResultLoading,
} from '@weareinreach/ui/components/core/Saved/SavedOrgResultCard'
import { SavedServiceResultCard } from '@weareinreach/ui/components/core/Saved/SavedServiceResultCard'
import { formatDate } from '~app/pages/account/saved'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { Icon } from '~ui/icon'
// @ts-expect-error Next Dynamic doesn't like polymorphic components
const QuickPromotionModal = dynamic(() =>
	import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal)
)

const SavedLists = () => {
	const { t, i18n } = useTranslation('common')
	const { data: session, status } = useSession()
	const router = useRouter<'/account/saved/[listId]'>()
	const { listId } = router.query
	const handleReturnHome = useCallback(() => router.replace('/'), [router])
	const { data: queryResult, isLoading } = api.savedList.getById.useQuery(
		{ id: listId ?? '' },
		{ enabled: !!listId }
	)

	const apiUtils = api.useUtils()
	const { query } = router
	const initialTab = query.tab ? (query.tab as string) : 'organizations'
	const [activeTab, setActiveTab] = useState(initialTab)

	useEffect(() => {
		const currentTab = query.tab ? (query.tab as string) : 'organizations'
		setActiveTab(currentTab)
	}, [query.tab])

	useEffect(() => {
		apiUtils.savedList.getById.invalidate({ id: listId ?? '' })
		apiUtils.savedList.getAll.invalidate()
	}, [])

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

	const handleTabChange = (tab: string) => {
		setActiveTab(tab)
		if (listId) {
			router.push(
				{
					pathname: router.pathname,
					query: { ...router.query, tab, listId },
				},
				undefined,
				{ shallow: true }
			)
		}
	}

	const { data: allSavedLists } = api.savedList.getAll.useQuery()

	const deleteMutation = api.savedList.delete.useMutation({
		onSuccess: () => {
			apiUtils.savedList.getById.invalidate({ id: listId ?? '' })
			apiUtils.savedList.getAll.invalidate()
			router.replace('/account/saved')
		},
	})

	return (
		<Container size='lg' px='md' py='lg' style={{ minWidth: '100%' }}>
			<Stack spacing='lg' style={{ paddingTop: '3rem' }}>
				<Group position='apart'>
					<Group
						align='center'
						spacing={8}
						style={{ cursor: 'pointer' }}
						onClick={() => router.replace('/account/saved')}
					>
						<Icon icon='carbon:arrow-left' />
						<Text>{t('list.back')}</Text>
					</Group>

					<Group spacing={16}>
						<Group align='center' spacing={8} style={{ cursor: 'pointer' }} onClick={() => window.print()}>
							<Icon icon='carbon:printer' />
							<Text>{t('words.print')}</Text>
						</Group>

						<Group
							align='center'
							spacing={8}
							style={{ cursor: 'pointer' }}
							onClick={() => deleteMutation.mutate({ id: queryResult?.id ?? '' })}
						>
							<Icon icon='carbon:trash-can' />
							<Text>{t('words.delete')}</Text>
						</Group>
					</Group>
				</Group>

				<Stack mt='md' mb='md'>
					<Title order={2}>{queryResult?.name ?? ''}</Title>
					<Text>
						{t('list.updated')} {formatDate(queryResult?.updatedAt ?? new Date(Date.now()))} &#8226;{' '}
						{t('list.resourcesCount', {
							count: queryResult ? queryResult._count?.organizations + queryResult?._count?.services : 0,
						})}
					</Text>
				</Stack>

				<Tabs value={activeTab} onTabChange={handleTabChange}>
					<Tabs.List>
						<Tabs.Tab value='organizations'>Organizations</Tabs.Tab>
						<Tabs.Tab value='services'>Services</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='organizations' pt='xs'>
						{isLoading ? (
							<SavedResultLoading />
						) : queryResult?._count?.organizations === 0 ? (
							<Text>{t('list.no-orgs')}</Text>
						) : (
							queryResult?.organizations?.map((result) => {
								return <SavedOrgResultCard key={result.id} result={result} />
							})
						)}
					</Tabs.Panel>
					<Tabs.Panel value='services' pt='xs'>
						{isLoading ? (
							<Center>
								<Loader />
							</Center>
						) : queryResult?._count?.services === 0 ? (
							<Text>{t('list.no-services')}</Text>
						) : (
							queryResult?.services?.map((result) => {
								return <SavedServiceResultCard key={result.id} result={result} />
							})
						)}{' '}
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</Container>
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
