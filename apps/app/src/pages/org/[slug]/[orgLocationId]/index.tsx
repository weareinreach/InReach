import { createStyles, Divider, Grid, Stack, Tabs, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
// import compact from 'just-compact'
import { type GetStaticPaths, type GetStaticProps, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
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
	const { slug, orgLocationId } = router.isReady ? router.query : { slug: '', orgLocationId: '' }
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const {
		data: orgData,
		status: orgDataStatus,
		isError: orgDataIsError,
		error: orgDataError,
	} = api.organization.forLocationPage.useQuery({ slug }, { enabled: router.isReady })
	const {
		data,
		status,
		isError: pageFetchIsError,
		error: pageFetchError,
	} = api.location.forLocationPage.useQuery({ id: orgLocationId }, { enabled: router.isReady })

	interface Alert {
		key: string
		icon: string
		text: string
	}

	const { data: alertData }: { data: Alert[] } = { data: [] }
	const { classes } = useStyles()

	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (data && status === 'success' && orgData && orgDataStatus === 'success') {
			setLoading(false)
		}
	}, [data, status, orgData, orgDataStatus])

	const handleTabChange = useCallback((tab: Tabname) => {
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

	if (
		(orgDataIsError || pageFetchIsError) &&
		(orgDataError?.data?.code === 'NOT_FOUND' || pageFetchError?.data?.code === 'NOT_FOUND')
	) {
		router.replace('/404')
	}

	if (loading || !data || !orgData || router.isFallback) {
		return <OrgLocationPageLoading />
	}
	const { attributes, description, reviews } = data

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: `${orgData.name} - ${data.name}` })}</title>
			</Head>
			<Grid.Col xs={12} sm={8} order={1}>
				<Toolbar
					breadcrumbProps={{
						option: 'back',
						backTo: 'dynamicText',
						backToText: orgData.name,
						onClick: () => {
							router.push({
								pathname: '/org/[slug]',
								query: { slug: orgData.slug },
							})
						},
					}}
					organizationId={orgData.id}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					{hasAlerts &&
						alertData?.map((alert) => (
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
							name: data.name ?? orgData.name,
							id: data.id,
							locations: [data],
							lastVerified: orgData.lastVerified,
							isClaimed: orgData.isClaimed,
							slug,
							description,
							attributes,
						}}
					/>
					{isTablet && (
						<Stack spacing={40} w='100%'>
							<Divider />
							<ContactSection role='org' parentId={data.id} />
							<Divider />
							<VisitCard locationId={data.id} />
						</Stack>
					)}
					<Tabs w='100%' value={activeTab} onTabChange={handleTabChange}>
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
			{!isTablet && (
				<Grid.Col order={2}>
					<Stack spacing={40}>
						<ContactSection role='org' parentId={data.id} />
						<VisitCard locationId={data.id} />
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
	RoutedQuery<'/org/[slug]/[orgLocationId]'>
> = async ({ locale, params }) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: z.string() }).safeParse(params)
	if (!urlParams.success) {
		return { notFound: true }
	}
	const { slug, orgLocationId } = urlParams.data

	const ssg = await trpcServerClient({ session: null })
	try {
		const redirect = await ssg.organization.slugRedirect.fetch(slug)
		if (redirect?.redirectTo) {
			return {
				redirect: {
					permanent: true,
					destination: `/org/${redirect.redirectTo}/${orgLocationId}`,
				},
			}
		}

		const orgId = await ssg.organization.getIdFromSlug.fetch({ slug })
		if (!orgId?.id) {
			return { notFound: true, revalidate: 1 }
		}

		const [i18n] = await Promise.allSettled([
			getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', orgId.id]),
			ssg.location.forLocationPage.prefetch({ id: orgLocationId }),
			ssg.organization.forLocationPage.prefetch({ slug }),
			ssg.location.getAlerts.prefetch({ id: orgLocationId }),
		])
		const props = {
			trpcState: ssg.dehydrate(),
			...(i18n.status === 'fulfilled' ? i18n.value : {}),
		}

		return {
			props,
			revalidate: 60 * 30, // 30 minutes
		}
	} catch (error) {
		const TRPCError = (await import('@trpc/server')).TRPCError
		if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
			return { notFound: true, revalidate: 1 }
		}
		return { redirect: { destination: '/500', permanent: false } }
	}
}
type Tabname = 'services' | 'photos' | 'reviews'
export default OrgLocationPage
