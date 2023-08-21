/* eslint-disable i18next/no-literal-string */
import { Grid, Stack, Tabs, Title } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { GoogleMap } from '@weareinreach/ui/components/core/GoogleMap'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/Contact'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
import { type NextPageWithOptions } from '~app/pages/_app'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const OrganizationPage: NextPageWithOptions = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]'>()
	const { query } = router.isReady ? router : { query: { slug: '' } }
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data, status } = api.organization.forOrgPageEdits.useQuery(query, { enabled: router.isReady })
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true },
		{
			enabled: !!data?.id && data?.locations.length > 1,
			select: (data) => data.length !== 0,
		}
	)
	const { ref, width } = useElementSize()
	useEffect(() => {
		if (data && status === 'success') setLoading(false)
	}, [data, status])
	if (loading || !data) return <>Loading</>

	const { attributes, description, slug, reviews, locations, isClaimed, id: organizationId } = data

	const sidebar =
		locations?.length === 1 ? (
			<>{locations[0] && <VisitCard locationId={locations[0].id} />}</>
		) : (
			locations.length && (
				<Stack ref={ref} miw='100%'>
					{width && (
						<GoogleMap
							locationIds={locations.map(({ id }) => id)}
							width={width}
							height={Math.floor(width * 1.185)}
						/>
					)}
				</Stack>
			)
		)

	return (
		<>
			<Grid.Col sm={12} order={0}>
				<Title order={1}>EDIT MODE</Title>
			</Grid.Col>
			<Grid.Col sm={8} order={1}>
				{/* <Toolbar
					breadcrumbProps={{ option: 'back', backTo: 'search', onClick: () => router.back() }}
					saved={Boolean(userLists?.length)}
					organizationId={organizationId}
				/> */}
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
					{locations.map((location) => (
						<LocationCard key={location.id} locationId={location.id} />
					))}
				</Stack>
			</Grid.Col>
			<Grid.Col order={2}>
				<Stack spacing={40}>
					<ContactSection role='org' parentId={data.id} />
					{/* </Grid.Col> */}
					{/* <Grid.Col order={4}> */}
					{sidebar}
				</Stack>
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<
	Record<string, unknown>,
	RoutedQuery<'/org/[slug]'>
> = async ({ locale, params, req, res }) => {
	if (!params) return { notFound: true }
	const { slug } = params

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
	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', slug])),
	}

	return {
		props,
	}
}
export default OrganizationPage
