/* eslint-disable i18next/no-literal-string */
import { Code, Grid, Stack, Title, Text, Tabs } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { Toolbar, Rating, Badge, BadgeGroup, type CustomBadgeProps } from '@weareinreach/ui/components/core'
import {
	ContactSection,
	ServicesInfoCard,
	PhotosSection,
	ReviewSection,
	VisitCard,
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
	} = data

	const isClaimed = Boolean(data.allowedEditors.length)

	const leaderAttributes = attributes.filter(({ attribute }) => {
		attribute.categories.some(({ category }) => {
			category.tag === 'orgLeader'
		})
	})
	const infoBadges = () => {
		const output: CustomBadgeProps[] = []
		if (leaderAttributes.length) {
			leaderAttributes.forEach((entry) =>
				output.push({
					variant: 'leader',
					icon: entry.attribute.icon ?? '',
					color: entry.attribute.iconBg ?? '#FFF',
					tsKey: entry.attribute.tsKey,
				})
			)
		}
		if (data.lastVerified)
			output.push({
				variant: 'verified',
				lastverified: data.lastVerified.toString(),
			})
		output.push({
			variant: isClaimed ? 'claimed' : 'unclaimed',
		})

		return output
	}

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
			<></>
		)

	const sidebar =
		locations?.length === 1 ? <>{locations[0] && <VisitCard location={locations[0]} />}</> : <></>

	return (
		<>
			<Grid.Col sm={8} order={1}>
				<Toolbar
					breadcrumbProps={{ option: 'back', backTo: 'search', onClick: () => router.back() }}
					saved={Boolean(userLists.length)}
				/>
				<Stack pt={24} align='flex-start' spacing={40}>
					<Stack align='flex-start' spacing={12}>
						<Title order={2}>{data.name}</Title>
						<Rating organizationId={data.id} />
						<BadgeGroup badges={infoBadges()} withSeparator />
						{description?.key && (
							<Text>{t(description.key, { ns: slug, defaultValue: description.tsKey.text })}</Text>
						)}
					</Stack>
					{/* </Grid.Col> */}
					{/* <Grid.Col sm={8} order={3}> */}
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
		...(await getServerSideTranslations(locale ?? 'en', ['common', 'services', 'attribute', slug])),
	}

	return {
		props,
	}
}

export default OrganizationPage
