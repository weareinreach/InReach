// apps/app/src/pages/dashboards/unpublished-status/index.tsx

import { Card, SimpleGrid, Skeleton, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { type NextPageWithOptions } from '~app/pages/_app'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const UnpublishedStatusSummary: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const { data, isLoading } = api.dashboard.unpublishedStatusSummary.useQuery()

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Unpublished Status' })}</title>
			</Head>
			{/* eslint-disable-next-line i18next/no-literal-string -- internal-only, gated page */}
			<Title order={2}>Unpublished Status</Title>
			{/* eslint-disable-next-line i18next/no-literal-string -- internal-only, gated page */}
			<Text c='dimmed' mt={4}>
				Organizations that are unpublished with no reason set yet, grouped by what's actually knowable about
				each one - a starting point for review, not a suggested answer. See the Unpublished Status design doc
				for what each group means.
			</Text>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='lg' mt='xl'>
				{isLoading
					? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height={110} radius='lg' />)
					: data?.map((row) => (
							<Card
								key={row.tier}
								component={Link}
								href={{ pathname: '/dashboards/unpublished-status/list', query: { tier: row.tier } }}
								withBorder
								padding='lg'
								radius='lg'
							>
								<Text size='xl' fw={700}>
									{row.count}
								</Text>
								<Text size='sm' c='dimmed' mt={4}>
									{row.tier}
								</Text>
							</Card>
						))}
			</SimpleGrid>
		</>
	)
}

export default UnpublishedStatusSummary

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalManager', 'dataPortalAdmin', 'root'],
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
	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}
