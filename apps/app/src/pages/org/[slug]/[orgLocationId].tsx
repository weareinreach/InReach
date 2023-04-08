import { Grid, Stack, Tabs, Image } from '@mantine/core'
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
import { useState, useEffect } from 'react'
import { z } from 'zod'

import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const OrgLocationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]'>()
	const { query } = router
	const { slug, orgLocationId } = query
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const { data: orgData, status: orgDataStatus } = api.organization.getBySlug.useQuery(query)
	const { data, isLoading, status } = api.location.getById.useQuery({ id: orgLocationId })
	const { data: isSaved } = api.savedList.isSaved.useQuery(orgData?.id as string, {
		enabled: orgDataStatus === 'success' && Boolean(orgData?.id),
	})
	useEffect(() => {
		if (data && status === 'success' && orgData && orgDataStatus === 'success') setLoading(false)
	}, [data, status, orgData, orgDataStatus])
	if (loading || !data || !orgData) return <>Loading</>

	const { emails, phones, socialMedia, websites, attributes, description, services, photos, reviews } = data

	const locations = (() => {
		const { street1, street2, city, postCode, govDist, country } = data
		return [{ street1, street2, city, postCode, govDist, country }]
	})()

	return (
		<>
			<Grid.Col sm={8} order={1}>
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
				</Stack>
			</Grid.Col>
			<Grid.Col order={2}>
				<Stack spacing={40}>
					<ContactSection role='org' data={{ emails, phones, socialMedia, websites }} />
					<VisitCard location={data} />
				</Stack>
			</Grid.Col>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ locale, params }) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: z.string() }).safeParse(params)
	if (!urlParams.success) return { notFound: true }
	const { slug, orgLocationId } = urlParams.data

	const ssg = await trpcServerClient()
	await ssg.organization.getBySlug.prefetch({ slug })
	await ssg.location.getById.prefetch({ id: orgLocationId })
	const props = {
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', slug])),
	}

	return {
		props,
	}
}
export default OrgLocationPage
