import {
	Button,
	Center,
	Container,
	Divider,
	Grid,
	Group,
	Loader,
	Overlay,
	Paper,
	Stack,
	Tabs,
	Text,
	Title,
} from '@mantine/core'
import { type GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import { type JSX, useEffect, useState } from 'react'
import { z } from 'zod'

import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { getServerSession } from '@weareinreach/auth'
import {
	type Organization,
	SavedResultCard,
	type Service,
} from '@weareinreach/ui/components/core/SavedResultCard'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
// import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { Icon } from '~ui/icon'

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
	const router = useRouter<'/account/saved/[listId]'>()
	const { listId } = router.query
	const handleReturnHome = useCallback(() => router.replace('/'), [router])
	const { data: queryResult } = api.savedList.getById.useQuery({ id: listId ?? '' }, { enabled: !!listId })
	const [organizations, setOrganizations] = useState<Organization[]>()
	const [services, setServices] = useState<Service[]>()

	const [organizationDisplay, setOrginizationDisplay] = useState<JSX.Element[]>(
		Array.from({ length: 10 }, (_x, i) => <SavedResultCard key={i} loading />)
	)

	const [serviceDisplay, setServiceDisplay] = useState<JSX.Element[]>(
		Array.from({ length: 10 }, (_x, i) => <SavedResultCard key={i} loading />)
	)

	useEffect(() => {
		// if (loadingPage !== searchIsLoading) {
		// 	setLoadingPage(searchIsLoading)
		// }
		if (queryResult?._count.organizations) {
			// setResultCount(searchQuery?._count.organizations)
			setOrganizations(
				queryResult?.organizations?.map((org: ApiOutput['savedList']['getById']['organizations'][0]) => ({
					id: org.organization.id,
					slug: org.organization.slug,
					name: org.organization.name,
					description: org.organization.description,
					// locations: org.organization.locations,
					// orgLeader: org.organization.orgLeader,
					// orgFocus: org.organization.orgFocus,
					// serviceCategories: org.organization.serviceCategories,
					// national: org.organization.national,
				})) ?? []
			)
			// setLoadingPage(false)
		}

		if (queryResult?._count.services) {
			setServices(
				queryResult?.services?.map((service: ApiOutput['savedList']['getById']['services'][0]) => ({
					id: service.service.id,
					slug: 'service.service.slug',
					name: service.service.serviceName.tsKey.text,
					description: service.service.description,
				})) ?? []
			)
			// setLoadingPage(false)
		}
	}, [queryResult])

	useEffect(() => {
		if (organizations) {
			setOrginizationDisplay(
				organizations.map((result) => {
					return <SavedResultCard key={result.description?.tsKey.key} result={result} loading={false} />
				})
			)
		}
	}, [organizations])

	useEffect(() => {
		if (services) {
			setServiceDisplay(
				services?.map((result) => {
					return (
						<SavedResultCard key={result.description?.tsKey?.key ?? ''} result={result} loading={false} />
					)
				})
			)
		}
	}, [organizations])

	const [activeTab, setActiveTab] = useState('organizations')

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
	}

	return (
		queryResult && (
			<Container size='lg' px='md' py='lg'>
				<Stack spacing='lg'>
					<Group align='center' spacing={8} style={{ cursor: 'pointer' }} onClick={() => router.back()}>
						<Icon icon='carbon:arrow-left' />
						<Text>Back to Saved</Text>
					</Group>

					<Stack mt='md' mb='md'>
						<Title order={2}>{queryResult.name ?? ''}</Title>
						<Text>
							Updated {formatDate(queryResult.updatedAt)} &#8226; {queryResult._count.organizations} resources
						</Text>
					</Stack>

					<Tabs defaultValue={'organizations'} onTabChange={handleTabChange}>
						<Tabs.List>
							<Tabs.Tab value='organizations'>Organizations</Tabs.Tab>
							<Tabs.Tab value='services'>Services</Tabs.Tab>
						</Tabs.List>
						<Tabs.Panel value='organizations' pt='xs'>
							{activeTab === 'organizations' && organizationDisplay}
						</Tabs.Panel>
						<Tabs.Panel value='services' pt='xs'>
							{activeTab === 'services' && serviceDisplay}
						</Tabs.Panel>
					</Tabs>
				</Stack>
			</Container>
		)
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
