import { createStyles, Divider, Grid, Skeleton, Stack, Tabs, useMantineTheme } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { AlertMessage } from '@weareinreach/ui/components/core/AlertMessage'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
import { OrgLocationPageLoading } from '@weareinreach/ui/loading-states/OrgLocationPage'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const useStyles = createStyles((theme) => ({
	tabsList: {
		position: 'sticky',
		top: 0,
		zIndex: 10,
		backgroundColor: theme.other.colors.secondary.white,
	},
}))

const OrgLocationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]'>()
	const { query } = router.isReady ? router : { query: { slug: '', orgLocationId: '' } }
	const { slug, orgLocationId } = query
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data: orgData, status: orgDataStatus } = api.organization.getBySlug.useQuery(query, {
		enabled: router.isReady,
	})
	const { data, status } = api.location.forLocationPage.useQuery({ id: orgLocationId })
	const { data: isSaved } = api.savedList.isSaved.useQuery(orgData?.id as string, {
		enabled: orgDataStatus === 'success' && Boolean(orgData?.id),
	})
	const { data: alertData } = api.location.getAlerts.useQuery(
		{ id: orgLocationId },
		{ enabled: router.isReady }
	)
	const hasAlerts = Array.isArray(alertData) && alertData.length > 0
	const { classes } = useStyles()

	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (data && status === 'success' && orgData && orgDataStatus === 'success') setLoading(false)
	}, [data, status, orgData, orgDataStatus])
	if (loading || !data || !orgData) return <OrgLocationPageLoading />

	const {
		// emails,
		// phones,
		// socialMedia,
		// websites,
		attributes,
		description,
		// photos,
		reviews,
	} = data

	return (
		<>
			<Head>
				<title>{t('page-title.edit-mode', { ns: 'common', title: `${orgData.name} - ${data.name}` })}</title>
			</Head>
			<Grid.Col xs={12} sm={8} order={1}>
				<Toolbar
					breadcrumbProps={{
						option: 'back',
						backTo: 'dynamicText',
						backToText: orgData.name,
						onClick: () =>
							router.push({
								pathname: '/org/[slug]/edit',
								query: { slug: orgData.slug },
							}),
					}}
					organizationId={orgData.id}
					saved={Boolean(isSaved)}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					{hasAlerts &&
						alertData.map((alert) => (
							<AlertMessage
								key={alert.key}
								iconKey={alert.icon}
								ns={orgData.id}
								textKey={alert.key}
								defaultText={alert.text}
							/>
						))}
					<ListingBasicInfo
						data={{
							name: data.name || orgData.name,
							id: data.id,
							slug,
							locations: [data],
							description,
							lastVerified: orgData.lastVerified,
							attributes,
							isClaimed: orgData.isClaimed,
						}}
						// edit
					/>
					<Tabs
						w='100%'
						value={activeTab}
						onTabChange={(tab) => {
							setActiveTab(tab)
							switch (tab) {
								case 'services': {
									servicesRef.current?.scrollIntoView({ behavior: 'smooth' })
									break
								}
								case 'photos': {
									photosRef.current?.scrollIntoView({ behavior: 'smooth' })
									break
								}
								case 'reviews': {
									reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
									break
								}
							}
						}}
					>
						<Tabs.List className={classes.tabsList}>
							<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
							<Tabs.Tab value='photos'>{t('photo', { count: 2 })}</Tabs.Tab>
							<Tabs.Tab value='reviews'>{t('review', { count: 2 })}</Tabs.Tab>
						</Tabs.List>
						<Stack spacing={40} pt={40}>
							<div ref={servicesRef}>
								<ServicesInfoCard parentId={data.id} />
							</div>
							<div ref={photosRef}>
								<PhotosSection parentId={data.id} />
							</div>
							<div ref={reviewsRef}>
								<ReviewSection reviews={reviews} />
							</div>
						</Stack>
					</Tabs>
				</Stack>
			</Grid.Col>
			<Grid.Col order={2}>
				<Stack spacing={40}>
					<ContactSection role='org' parentId={data.id} edit />
					<VisitCard locationId={data.id} edit />
				</Stack>
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ locale, params, req, res }) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: z.string() }).safeParse(params)
	if (!urlParams.success) return { notFound: true }
	const { slug, orgLocationId } = urlParams.data
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic'],
		has: 'some',
	})

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
	const ssg = await trpcServerClient({ session })
	await ssg.organization.getBySlug.prefetch({ slug })
	await ssg.location.getById.prefetch({ id: orgLocationId })
	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', slug])),
	}

	return {
		props,
	}
}
export default OrgLocationPage
