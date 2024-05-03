import { createStyles, Divider, Grid, Stack, Tabs, useMantineTheme } from '@mantine/core'
import { useElementSize, useMediaQuery } from '@mantine/hooks'
import { type GetStaticPaths, type GetStaticProps, type InferGetStaticPropsType } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { AlertMessage } from '@weareinreach/ui/components/core/AlertMessage'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
import { useSearchState } from '@weareinreach/ui/hooks/useSearchState'
import { OrgPageLoading } from '@weareinreach/ui/loading-states/OrgPage'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { nsFormatter } from '~app/utils/nsFormatter'

const GoogleMap = dynamic(() =>
	import('@weareinreach/ui/components/core/GoogleMap').then((mod) => mod.GoogleMap)
)

const formatNS = nsFormatter(['common', 'services', 'attribute', 'phone-type'])
const useStyles = createStyles((theme) => ({
	tabsList: {
		position: 'sticky',
		top: 0,
		zIndex: 10,
		backgroundColor: theme.other.colors.secondary.white,
	},
}))

const OrganizationPage = ({
	slug: passedSlug,
	organizationId: orgId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
	const router = useRouter<'/org/[slug]'>()
	const slug = passedSlug ?? router.query.slug
	const { data, status } = api.organization.forOrgPage.useQuery({ slug })
	// const { query } = router
	const { t } = useTranslation(formatNS(orgId))
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true },
		{
			enabled: !!data?.id && data?.locations?.length > 1,
			select: (serviceInfoResult) => serviceInfoResult.length !== 0,
		}
	)
	const { data: alertData } = api.organization.getAlerts.useQuery({ slug }, { enabled: !!slug })
	const hasAlerts = Array.isArray(alertData) && alertData.length > 0
	const { ref, width } = useElementSize()
	const { searchState } = useSearchState()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const { classes } = useStyles()
	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (data && status === 'success' && !router.isFallback) {
			setLoading(false)
			if (data.locations?.length > 1) {
				setActiveTab('locations')
			}
		}
	}, [data, status, router.isFallback])

	const handleTabChange = useCallback((tab: string) => {
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
	}, [])

	const renderSidebar = useCallback(
		(locationData: NonNullable<typeof data>['locations'] | undefined) => {
			if (!locationData || locationData.length === 0) {
				return null
			}
			if (locationData.length === 1) {
				const soloLocation = locationData.at(0)
				if (!soloLocation) {
					return null
				}
				return (
					<>
						{isTablet && <Divider />}
						<VisitCard locationId={soloLocation.id} />
					</>
				)
			}
			// Hide google map temporarily for 'sm' breakpoint
			if (isTablet) {
				return null
			}
			return (
				<Stack ref={ref} miw='100%'>
					{Boolean(width) && (
						<GoogleMap
							locationIds={locationData.map(({ id }) => id)}
							width={width}
							height={Math.floor(width * 1.185)}
						/>
					)}
				</Stack>
			)
		},
		[isTablet, ref, width]
	)

	if (loading || !data || router.isFallback) {
		return <OrgPageLoading />
	}

	const { attributes, description, reviews, locations, isClaimed, id: organizationId } = data

	const body =
		locations?.length <= 1 ? (
			<Tabs w='100%' value={activeTab} onTabChange={handleTabChange}>
				<Tabs.List className={classes.tabsList}>
					<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
					<Tabs.Tab value='photos'>{t('photo', { count: 2 })}</Tabs.Tab>
					<Tabs.Tab value='reviews'>{t('review', { count: 2 })}</Tabs.Tab>
				</Tabs.List>
				<Stack spacing={40} pt={40}>
					<div ref={servicesRef}>
						<ServicesInfoCard parentId={organizationId} />
					</div>
					<div ref={photosRef}>
						<PhotosSection parentId={organizationId} />
					</div>
					<div ref={reviewsRef}>
						<ReviewSection reviews={reviews} />
					</div>
				</Stack>
			</Tabs>
		) : (
			<Tabs w='100%' value={activeTab} onTabChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value='locations'>{t('offices-and-locations')}</Tabs.Tab>
				</Tabs.List>
				<Stack pt={40} spacing={40}>
					{locations.map((location) => (
						<LocationCard key={location.id} locationId={location.id} />
					))}
					{hasRemote && <LocationCard remoteOnly />}
				</Stack>
			</Tabs>
		)

	const sidebar = renderSidebar(locations)

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: data.name })}</title>
			</Head>
			<Grid.Col xs={12} sm={8} order={1} pb={40}>
				<Toolbar
					hideBreadcrumb={!searchState.params.length}
					breadcrumbProps={{
						option: 'back',
						backTo: 'search',
					}}
					organizationId={organizationId}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					{hasAlerts &&
						alertData.map((alert) => {
							if (!alert.key) {
								return null
							}
							return (
								<AlertMessage
									key={alert.key}
									iconKey={alert.icon}
									ns={organizationId}
									textKey={alert.key}
									defaultText={alert.text}
								/>
							)
						})}
					<ListingBasicInfo
						data={{
							name: data.name,
							id: data.id,
							lastVerified: data.lastVerified,
							slug,
							attributes,
							description,
							locations,
							isClaimed,
						}}
					/>
					{isTablet && (
						<Stack spacing={40} w='100%'>
							<Divider />
							<ContactSection role='org' parentId={data.id} />
							{sidebar}
						</Stack>
					)}
					{body}
				</Stack>
			</Grid.Col>
			{!isTablet && (
				<Grid.Col order={2}>
					<Stack spacing={40}>
						<ContactSection role='org' parentId={data.id} />
						{sidebar}
					</Stack>
				</Grid.Col>
			)}
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true,
	}
	// }
}

export const getStaticProps: GetStaticProps<
	{ slug: string; organizationId: string },
	RoutedQuery<'/org/[slug]'>
> = async ({ locale, params }) => {
	if (!params) {
		return { notFound: true }
	}
	const { slug } = params
	const ssg = await trpcServerClient({ session: null })
	try {
		const redirect = await ssg.organization.slugRedirect.fetch(slug)
		if (redirect?.redirectTo) {
			return {
				redirect: {
					permanent: true,
					destination: `/org/${redirect.redirectTo}`,
				},
			}
		}

		const { id: orgId } = await ssg.organization.getIdFromSlug.fetch({ slug })
		if (!orgId) {
			return { notFound: true }
		}

		const [i18n] = await Promise.allSettled([
			getServerSideTranslations(locale, formatNS(orgId)),
			ssg.organization.forOrgPage.prefetch({ slug }),
		])

		const props = {
			trpcState: ssg.dehydrate(),
			organizationId: orgId,
			slug,
			...(i18n.status === 'fulfilled' ? i18n.value : {}),
		}

		return {
			props,
			revalidate: 60 * 30, // 30 minutes
		}
	} catch (error) {
		const TRPCError = (await import('@trpc/server')).TRPCError
		if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
			return { notFound: true }
		} else {
			return { redirect: { destination: '/500', permanent: false } }
		}
	}
}

export default OrganizationPage
