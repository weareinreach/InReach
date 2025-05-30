import { createStyles, Divider, Grid, Skeleton, Stack, Tabs, Title, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { type GetStaticPaths, type GetStaticProps, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { Breadcrumb } from '@weareinreach/ui/components/core/Breadcrumb'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const LoadingState = () => (
	<>
		<Grid.Col sm={8} order={1}>
			{/* Toolbar */}
			<Skeleton h={48} w='100%' radius={8} />
			<Stack pt={24} align='flex-start' spacing={40}>
				{/* Listing Basic */}
				<Skeleton h={260} w='100%' />
				{/* Body */}
				<Skeleton h={520} w='100%' />
				{/* Tab panels */}
			</Stack>
		</Grid.Col>
		<Grid.Col order={2}>
			<Stack spacing={40}>
				{/* Contact Card */}
				<Skeleton h={520} w='100%' />
				{/* Visit Card  */}
				<Skeleton h={260} w='100%' />
			</Stack>
		</Grid.Col>
	</>
)

const useStyles = createStyles((theme) => ({
	tabsList: {
		position: 'sticky',
		top: 0,
		zIndex: 10,
		backgroundColor: theme.other.colors.secondary.white,
	},
}))

const RemoteServicesPage: NextPage = () => {
	const { t } = useTranslation('common')
	const router = useRouter<'/org/[slug]/remote'>()
	const { slug } = router.isReady ? router.query : { slug: '' }
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)

	const { data: org, status } = api.organization.getIdFromSlug.useQuery({ slug }, { enabled: router.isReady })
	const { data: orgName, status: orgNameStatus } = api.organization.getNameFromSlug.useQuery(slug, {
		enabled: router.isReady,
	})
	const { classes } = useStyles()
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
			pathname: '/org/[slug]',
			query: { slug },
		})
	}, [router, slug])
	const handleTabChange = useCallback(
		(tab: string) => {
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
					{t('page-title.base', {
						ns: 'common',
						title: `${orgName.name} - ${t('common:remote-services-page-title')}`,
					})}
				</title>
			</Head>
			<Grid.Col xs={12} sm={8} order={1}>
				<Breadcrumb
					{...{
						option: 'back',
						backTo: 'dynamicText',
						backToText: orgName.name,
						onClick: handleBreadcrubClick,
					}}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					<Title order={2}>{t('common:remote-services')}</Title>
					{isTablet && (
						<Stack spacing={40} w='100%'>
							<Divider />
							<ContactSection role='org' parentId={org.id} />
						</Stack>
					)}
					<Tabs w='100%' value={activeTab} onTabChange={handleTabChange}>
						<Tabs.List className={classes.tabsList}>
							<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
						</Tabs.List>
						<Stack spacing={40} pt={40}>
							<div ref={servicesRef}>
								<ServicesInfoCard parentId={org.id} remoteOnly />
							</div>
						</Stack>
					</Tabs>
				</Stack>
			</Grid.Col>
			{!isTablet && (
				<Grid.Col order={2}>
					<Stack spacing={40}>
						<ContactSection role='org' parentId={org.id} />
					</Stack>
				</Grid.Col>
			)}
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: 'blocking',
	}
}
export const getStaticProps: GetStaticProps<
	Record<string, unknown>,
	RoutedQuery<'/org/[slug]/remote'>
> = async ({ locale, params }) => {
	if (!params?.slug) {
		return {
			notFound: true,
		}
	}

	const { slug } = params

	const ssg = await trpcServerClient({ session: null })
	const orgId = await ssg.organization.getIdFromSlug.fetch({ slug })
	if (!orgId?.id) {
		return { notFound: true }
	}

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', orgId.id]),
		ssg.organization.getNameFromSlug.prefetch(slug),
		// ssg.organization.getIdFromSlug.prefetch({ slug }),
	])
	const props = {
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return {
		props,
		revalidate: 60 * 30, // 30 minutes
	}
}

export default RemoteServicesPage
