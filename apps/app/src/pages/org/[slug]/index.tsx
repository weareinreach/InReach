/* eslint-disable i18next/no-literal-string */
import { createStyles, Divider, Grid, Skeleton, Stack, Tabs, useMantineTheme } from '@mantine/core'
import { useElementSize, useMediaQuery } from '@mantine/hooks'
import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useRef, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
// import { getEnv } from '@weareinreach/env'
// import { prisma } from '@weareinreach/db/client'
import { GoogleMap } from '@weareinreach/ui/components/core/GoogleMap'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/Contact'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
import { useSearchState } from '@weareinreach/ui/providers/SearchState'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const LoadingState = () => (
	<>
		<Grid.Col sm={8} order={1} pb={40}>
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

const OrganizationPage = ({ slug }: InferGetStaticPropsType<typeof getStaticProps>) => {
	const router = useRouter<'/org/[slug]'>()
	// const { query } = router
	const { t, i18n } = useTranslation(['common', 'services', 'attribute', 'phone-type', slug], {
		bindI18n: 'languageChanged loaded',
	})
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data, status } = api.organization.forOrgPage.useQuery({ slug }, { enabled: !!slug })
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true },
		{
			enabled: !!data?.id && data?.locations.length > 1,
			select: (data) => data.length !== 0,
		}
	)
	const { ref, width } = useElementSize()
	const { searchParams } = useSearchState()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const { classes } = useStyles()
	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	console.log('fallback?', router.isFallback)
	useEffect(() => {
		if (data && status === 'success') {
			setLoading(false)
			if (data.locations?.length > 1) setActiveTab('locations')
		}
	}, [data, status])

	useEffect(() => {
		slug &&
			i18n.reloadResources(i18n.resolvedLanguage, ['common', 'services', 'attribute', 'phone-type', slug])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (loading || !data || router.isFallback) return <LoadingState />

	const { userLists, attributes, description, reviews, locations, isClaimed, id: organizationId } = data

	const body =
		locations?.length <= 1 ? (
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

	const sidebar =
		locations?.length === 1 ? (
			<>
				{locations[0] && (
					<>
						{isTablet && <Divider />}
						<VisitCard locationId={locations[0].id} />
					</>
				)}
			</>
		) : (
			// Hide google map temporarily for 'sm' breakpoint
			Boolean(locations.length) &&
			!isTablet && (
				<>
					{isTablet && <Divider />}
					<Stack ref={ref} miw='100%'>
						{width && (
							<GoogleMap
								locationIds={locations.map(({ id }) => id)}
								width={width}
								height={Math.floor(width * 1.185)}
							/>
						)}
					</Stack>
				</>
			)
		)

	return (
		<>
			<Head>
				<title>{t('page-title.base', { ns: 'common', title: data.name })}</title>
			</Head>
			<Grid.Col xs={12} sm={8} order={1} pb={40}>
				<Toolbar
					hideBreadcrumb={searchParams.searchState.params.length === 0}
					breadcrumbProps={{
						option: 'back',
						backTo: 'search',
					}}
					saved={Boolean(userLists?.length)}
					organizationId={organizationId}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					<ListingBasicInfo
						role='org'
						data={{
							name: data.name,
							id: data.id,
							slug,
							lastVerified: data.lastVerified,
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

export const getStaticProps = async ({
	locale,
	params,
}: GetStaticPropsContext<RoutedQuery<'/org/[slug]'>>) => {
	if (!params) return { notFound: true }
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

		const orgId = await ssg.organization.getIdFromSlug.fetch({ slug })
		// if (!orgId) return { notFound: true, props: {} }

		const [i18n] = await Promise.allSettled([
			orgId &&
				getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', orgId?.id]),
			ssg.organization.forOrgPage.prefetch({ slug }),
		])
		// await ssg.organization.getBySlug.prefetch({ slug })

		const props = {
			trpcState: ssg.dehydrate(),
			organizationId: orgId?.id,
			slug,
			...(i18n.status === 'fulfilled' ? i18n.value : {}),
		}

		return {
			props,
			revalidate: 60 * 30, // 30 minutes
		}
	} catch (error) {
		const TRPCError = (await import('@trpc/server')).TRPCError
		if (error instanceof TRPCError) {
			if (error.code === 'NOT_FOUND') {
				return { notFound: true }
			}
		}
	}
}

export default OrganizationPage
