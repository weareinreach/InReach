import { Center, Container, Group, Loader, Overlay, Stack, Tabs, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type inferRouterOutputs } from '@trpc/server'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useState } from 'react'

import { type appRouter } from '@weareinreach/api'
import { getServerSession } from '@weareinreach/auth'
import { ActionButtons } from '@weareinreach/ui/components/core/ActionButtons'
import {
	SavedOrgResultCard,
	SavedResultLoading,
} from '@weareinreach/ui/components/core/Saved/SavedOrgResultCard'
import { SavedServiceResultCard } from '@weareinreach/ui/components/core/Saved/SavedServiceResultCard'
import { Icon } from '@weareinreach/ui/icon'
import { formatDate } from '~app/pages/account/saved'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

type AppRouter = typeof appRouter
type ApiOutput = inferRouterOutputs<AppRouter>

type OrganizationType = NonNullable<ApiOutput['savedList']['getById']>['organizations'][number]
type ServiceType = NonNullable<ApiOutput['savedList']['getById']>['services'][number]

// @ts-expect-error Next Dynamic doesn't like polymorphic components
const QuickPromotionModal = dynamic(() =>
	import('@weareinreach/ui/modals/QuickPromotion').then((mod) => mod.QuickPromotionModal)
)

const SavedLists = () => {
	const { t } = useTranslation('common')
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
	const confirmDeleteModalHandler = useDisclosure(false)

	useEffect(() => {
		const currentTab = query.tab ? (query.tab as string) : 'organizations'
		setActiveTab(currentTab)
	}, [query.tab])

	const handleTabChange = useCallback(
		(tab: string) => {
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
		},
		[listId, router]
	)
	const deleteMutation = api.savedList.delete.useMutation({
		onSuccess: () => {
			const [, modalHandler] = confirmDeleteModalHandler
			apiUtils.savedList.invalidate()
			modalHandler.close()
			router.replace({ pathname: '/account/saved' })
		},
	})
	const handleDeleteList = useCallback(
		(listIdToDelete?: string) => {
			if (!listIdToDelete) {
				console.error('No list id')
				return () => void 0
			}
			return () => deleteMutation.mutate({ id: listIdToDelete })
		},
		[deleteMutation]
	)
	const handleGoBack = useCallback(() => {
		router.push({ pathname: '/account/saved' })
	}, [router])
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

	let organizationsContent
	if (isLoading) {
		organizationsContent = <SavedResultLoading />
	} else if (queryResult?._count?.organizations === 0) {
		organizationsContent = <Text>{t('list.no-orgs')}</Text>
	} else {
		const nonNullableOrganizations = queryResult!.organizations!.filter(
			(org: OrganizationType | null | undefined): org is OrganizationType => org !== null && org !== undefined
		)
		organizationsContent = nonNullableOrganizations.map((result: OrganizationType) => {
			return <SavedOrgResultCard key={result.id} result={result} loading={false} />
		})
	}

	let servicesContent
	if (isLoading) {
		servicesContent = (
			<Center>
				<Loader />
			</Center>
		)
	} else if (queryResult?._count?.services === 0) {
		servicesContent = <Text>{t('list.no-services')}</Text>
	} else {
		const nonNullableServices = queryResult!.services!.filter(
			(service: ServiceType | null | undefined): service is ServiceType =>
				service !== null && service !== undefined
		)
		servicesContent = nonNullableServices.map((result: ServiceType) => {
			return <SavedServiceResultCard key={result.id} result={result} loading={false} />
		})
	}

	return (
		<Container size='lg' px='md' py='lg' style={{ minWidth: '100%' }}>
			<Stack spacing='lg' style={{ paddingTop: '3rem' }}>
				<Group position='apart'>
					<Group align='center' spacing={8} style={{ cursor: 'pointer' }} onClick={handleGoBack}>
						<Icon icon='carbon:arrow-left' />
						<Text>{t('list.back')}</Text>
					</Group>

					<Group spacing={16}>
						<ActionButtons.Print />
						<ActionButtons.Delete
							onClick={handleDeleteList(queryResult?.id)}
							modalHandler={confirmDeleteModalHandler}
						/>
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
						<Tabs.Tab value='organizations'>{t('words.organizations')}</Tabs.Tab>
						<Tabs.Tab value='services'>{t('words.services')}</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='organizations' pt='xs'>
						{organizationsContent}
					</Tabs.Panel>
					<Tabs.Panel value='services' pt='xs'>
						{servicesContent}
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
