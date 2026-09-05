import { Divider, Grid, Group, Skeleton, Stack, Tabs, Title, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { type InferGetServerSidePropsType, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { type GetServerSideProps } from 'nextjs-routes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { Button } from '@weareinreach/ui/components/core'
import { Breadcrumb } from '@weareinreach/ui/components/core/Breadcrumb'
import { ServiceEditDrawer } from '@weareinreach/ui/components/data-portal/ServiceEditDrawer'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

import classes from './edit.module.css'

const addNewServiceLabel = 'Add new service'

const LoadingState = () => (
	<>
		<Grid.Col span={{ sm: 8 }} order={1}>
			<Skeleton h={48} w='100%' radius={8} />
			<Stack pt={24} align='flex-start' gap={40}>
				<Skeleton h={260} w='100%' />
				<Skeleton h={520} w='100%' />
			</Stack>
		</Grid.Col>
		<Grid.Col order={2}>
			<Stack gap={40}>
				<Skeleton h={520} w='100%' />
			</Stack>
		</Grid.Col>
	</>
)

const RemoteServicesEditPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
	const { t } = useTranslation('common')
	const router = useRouter<'/org/[slug]/remote/edit'>()
	const { slug } = router.isReady ? router.query : { slug: '' }
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)

	const { data: org, status } = api.organization.getIdFromSlug.useQuery({ slug }, { enabled: router.isReady })
	const { data: orgName, status: orgNameStatus } = api.organization.getNameFromSlug.useQuery(slug, {
		enabled: router.isReady,
	})
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const servicesRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (org && status === 'success' && orgName && orgNameStatus === 'success') {
			setLoading(false)
		}
	}, [org, status, orgName, orgNameStatus])
	const handleBreadcrubClick = useCallback(() => {
		router.push({
			pathname: '/org/[slug]/edit',
			query: { slug },
		})
	}, [router, slug])
	const handleTabChange = useCallback(
		(tab: string | null) => {
			if (!tab) {
				return
			}
			setActiveTab(tab)
			if (tab === 'services') {
				servicesRef.current?.scrollIntoView({ behavior: 'smooth' })
			}
		},
		[setActiveTab]
	)

	if (loading || !org || !orgName || router.isFallback) {
		return <LoadingState />
	}

	return (
		<>
			<Head>
				<title>
					{t('page-title.edit-mode', {
						ns: 'common',
						title: `${orgName.name} - ${t('common:remote-services-page-title')}`,
					})}
				</title>
			</Head>
			<Grid.Col span={{ base: 12, sm: 8 }} order={1}>
				<Breadcrumb
					{...{
						option: 'back',
						backTo: 'dynamicText',
						backToText: orgName.name,
						onClick: handleBreadcrubClick,
					}}
				/>
				<Stack pt={24} align='flex-start' gap={40}>
					<Title order={2}>{t('common:remote-services')}</Title>
					{isTablet && (
						<Stack gap={40} w='100%'>
							<Divider />
							<ContactSection role='org' parentId={org.id} edit />
						</Stack>
					)}
					<Tabs w='100%' value={activeTab} onChange={handleTabChange}>
						<Tabs.List className={classes.tabsList}>
							<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
						</Tabs.List>
						<Stack gap={40} pt={40}>
							<Stack gap={20} ref={servicesRef}>
								<Group justify='space-between'>
									<Title order={3}>{t('services')}</Title>
									<ServiceEditDrawer
										createNew
										autoAttachAttributeTag='offers-remote-services'
										component={Button}
										variant='primary'
									>
										{addNewServiceLabel}
									</ServiceEditDrawer>
								</Group>
								<ServicesInfoCard parentId={org.id} remoteOnly />
							</Stack>
						</Stack>
					</Tabs>
				</Stack>
			</Grid.Col>
			{!isTablet && (
				<Grid.Col order={2}>
					<Stack gap={40}>
						<ContactSection role='org' parentId={org.id} edit />
					</Stack>
				</Grid.Col>
			)}
		</>
	)
}

export const getServerSideProps: GetServerSideProps<
	Record<string, unknown>,
	'/org/[slug]/remote/edit'
> = async ({ locale, params, req, res }) => {
	const urlParams = z.object({ slug: z.string() }).safeParse(params)
	if (!urlParams.success) {
		return { notFound: true }
	}
	const { slug } = urlParams.data

	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root'],
		has: 'some',
	})
	if (!session) {
		return {
			redirect: {
				destination: `/org/${slug}/remote`,
				permanent: false,
			},
		}
	}

	const ssg = await trpcServerClient({ session })
	const { id: orgId } = await ssg.organization.getIdFromSlug.fetch({ slug })

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, [
			'common',
			'services',
			'attribute',
			'phone-type',
			'user',
			'gov-dist',
			orgId,
		]),
		ssg.organization.getNameFromSlug.prefetch(slug),
	])

	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return {
		props,
	}
}

export default RemoteServicesEditPage
