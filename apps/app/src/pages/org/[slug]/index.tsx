/* eslint-disable i18next/no-literal-string */
import { Grid, Stack, Tabs, Image } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { Toolbar } from '@weareinreach/ui/components/core'
import {
	ContactSection,
	ServicesInfoCard,
	PhotosSection,
	ReviewSection,
	VisitCard,
	ListingBasicInfo,
	LocationCard,
} from '@weareinreach/ui/components/sections'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useState, useEffect } from 'react'

import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const OrganizationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]'>()
	const { query } = router
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data, isLoading, status } = api.organization.getBySlug.useQuery(query)
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
			<Stack ref={ref}>
				<Image
					src={`http://via.placeholder.com/${Math.floor(width)}x${Math.floor(width * 1.185)}`}
					alt='map placeholder'
				/>
			</Stack>
		)

	return (
		<>
			<Grid.Col sm={8} order={1}>
				<Toolbar
					breadcrumbProps={{ option: 'back', backTo: 'search', onClick: () => router.back() }}
					saved={Boolean(userLists.length)}
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

export const getServerSideProps: GetServerSideProps<{}, RoutedQuery<'/org/[slug]'>> = async ({
	locale,
	params,
}) => {
	if (!params) return { notFound: true }
	const { slug } = params

	const ssg = await trpcServerClient()

	await ssg.organization.getBySlug.prefetch({ slug })
	const props = {
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['common', 'services', 'attribute', slug])),
	}

	return {
		props,
	}
}

export default OrganizationPage
