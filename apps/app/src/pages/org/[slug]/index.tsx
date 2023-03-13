/* eslint-disable i18next/no-literal-string */
import { Code, Grid, Stack, Title } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { Toolbar, Rating, Badge, type CustomBadgeProps } from '@weareinreach/ui/components/core'
import { ContactSection } from '@weareinreach/ui/components/sections'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'

import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const OrganizationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]'>()
	const { query } = router
	console.log(query)
	const { data, isLoading } = api.organization.getBySlug.useQuery(query)

	if (isLoading || !data) return <>Loading</>

	const { emails, phones, socialMedia, websites, allowedEditors, userLists, attributes, description } = data

	const isClaimed = Boolean(allowedEditors.length)

	const leaderAttributes = attributes.filter(({ attribute }) => {
		attribute.categories.some(({ category }) => {
			category.tag === 'orgLeader'
		})
	})
	const infoBadges = () => {
		const output: CustomBadgeProps[] = []
	}

	if (data?.locations?.length === 1) {
		return (
			<>
				<Grid.Col sm={8}>
					<Toolbar
						breadcrumbProps={{ option: 'back', backTo: 'search', onClick: () => router.back() }}
						saved={Boolean(userLists.length)}
					/>
					<Stack pt={24} align='flex-start' spacing={40}>
						<Stack>
							<Title order={1}>{data.name}</Title>
							<Rating organizationId={data.id} />
						</Stack>
					</Stack>
				</Grid.Col>
				<ContactSection role='org' data={{ emails, phones, socialMedia, websites }} />
			</>
		)
	}

	return (
		<>
			Multi Location view
			<Code block>{JSON.stringify(data, null, 2)}</Code>
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
	await ssg.organization.isSaved.prefetch(slug)
	const props = {
		trpcState: ssg.dehydrate(),
		...(await getServerSideTranslations(locale ?? 'en', ['common', slug])),
	}

	return {
		props,
	}
}

export default OrganizationPage
