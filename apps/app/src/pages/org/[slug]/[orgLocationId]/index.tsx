import { createStyles, Divider, Grid, Skeleton, Stack, Tabs, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
// import compact from 'just-compact'
import { type GetStaticPaths, type GetStaticPropsContext, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/Contact'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
// import { useScreenSize } from '@weareinreach/ui/hooks/useScreenSize'
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

const OrgLocationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]'>()
	const { query } = router
	const { slug, orgLocationId } = query
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const { data: orgData, status: orgDataStatus } = api.organization.forLocationPage.useQuery(query)
	const { data, status } = api.location.forLocationPage.useQuery({ id: orgLocationId })
	const { data: isSaved } = api.savedList.isSaved.useQuery(orgData?.id as string, {
		enabled: orgDataStatus === 'success' && Boolean(orgData?.id),
	})
	const { classes } = useStyles()

	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (data && status === 'success' && orgData && orgDataStatus === 'success') setLoading(false)
	}, [data, status, orgData, orgDataStatus])
	if (loading || !data || !orgData || router.isFallback) return <LoadingState />

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
						onClick: () =>
							router.push({
								pathname: '/org/[slug]',
								query: { slug: orgData.slug },
							}),
					}}
					organizationId={orgData.id}
					saved={Boolean(isSaved)}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					<ListingBasicInfo
						role='location'
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
					/>
					{isTablet && (
						<Stack spacing={40} w='100%'>
							<Divider />
							<ContactSection role='org' parentId={data.id} />
							<Divider />
							<VisitCard locationId={data.id} />
						</Stack>
					)}
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
		fallback: true,
	}
}
export const getStaticProps = async ({
	locale,
	params,
}: GetStaticPropsContext<RoutedQuery<'/org/[slug]/[orgLocationId]'>>) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: z.string() }).safeParse(params)
	if (!urlParams.success) return { notFound: true }
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
		if (!orgId?.id) return { notFound: true }

		const [i18n] = await Promise.allSettled([
			getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', orgId.id]),
			ssg.organization.getBySlug.prefetch({ slug }),
			// ssg.organization.getIdFromSlug.prefetch({ slug }),
			ssg.location.forLocationPage.prefetch({ id: orgLocationId }),
			ssg.organization.forLocationPage.prefetch({ slug }),
		])
		const props = {
			trpcState: ssg.dehydrate(),
			// ...(await getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', slug])),
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

export default OrgLocationPage
