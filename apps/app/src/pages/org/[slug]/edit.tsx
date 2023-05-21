/* eslint-disable i18next/no-literal-string */
import { Grid, Stack, Tabs, Title } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { type GetServerSideProps, type NextPage } from 'next'
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
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const OrganizationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]'>()
	const { query } = router
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data, status } = api.organization.getBySlug.useQuery(query)
	const { ref, width } = useElementSize()
	useEffect(() => {
		if (data && status === 'success') setLoading(false)
	}, [data, status])
	if (loading || !data) return <>Loading</>

	const {
		emails,
		phones,
		socialMedia,
		websites,
		userLists,
		attributes,
		description,
		slug,
		services,
		photos,
		reviews,
		locations,
		isClaimed,
		id: organizationId,
	} = data

	const body =
		locations?.length === 1 ? (
			<Tabs w='100%' value={activeTab} onTabChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
					<Tabs.Tab value='photos'>{t('photo', { count: 2 })}</Tabs.Tab>
					<Tabs.Tab value='reviews'>{t('review', { count: 2 })}</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value='services'>
					<ServicesInfoCard services={services} />
				</Tabs.Panel>
				<Tabs.Panel value='photos'>
					<PhotosSection photos={photos} />
				</Tabs.Panel>
				<Tabs.Panel value='reviews'>
					<ReviewSection reviews={reviews} />
				</Tabs.Panel>
			</Tabs>
		) : (
			<>
				{locations.map((location) => (
					<LocationCard key={location.id} location={location} />
				))}
			</>
		)

	const sidebar =
		locations?.length === 1 ? (
			<>{locations[0] && <VisitCard location={locations[0]} />}</>
		) : (
			locations.length && (
				<Stack ref={ref} miw='100%'>
					{width && <GoogleMap marker={locations} width={width} height={Math.floor(width * 1.185)} />}
				</Stack>
			)
		)

	return (
		<>
			<Title order={1}>EDIT MODE</Title>
			<Grid.Col sm={8} order={1}>
				<Toolbar
					breadcrumbProps={{ option: 'back', backTo: 'search', onClick: () => router.back() }}
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
					{body}
				</Stack>
			</Grid.Col>
			<Grid.Col order={2}>
				<Stack spacing={40}>
					<ContactSection role='org' data={{ emails, phones, socialMedia, websites }} />
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
