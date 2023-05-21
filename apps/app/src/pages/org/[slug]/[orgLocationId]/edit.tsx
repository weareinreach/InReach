import { Grid, Stack, Tabs, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { ContactSection } from '@weareinreach/ui/components/sections/Contact'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
// import {LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
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
			<Title order={1}>EDIT MODE</Title>
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
