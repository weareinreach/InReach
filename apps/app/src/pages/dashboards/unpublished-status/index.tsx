// apps/app/src/pages/dashboards/unpublished-status/index.tsx

/* eslint-disable i18next/no-literal-string -- internal-only, gated page */

import { Card, List, SimpleGrid, Skeleton, Text, Title } from '@mantine/core'
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
			<Title order={2}>Unpublished Status</Title>
			<Text c='dimmed' mt={4}>
				Organizations that are unpublished with no reason set yet, grouped by what's actually knowable about
				each one - a starting point for review, not a suggested answer.
			</Text>
			<List size='sm' c='dimmed' mt='sm' spacing={4}>
				<List.Item>
					<Text span fw={600} c='inherit'>
						1a - Never verified, not deleted, created &lt;30d ago:
					</Text>{' '}
					A new org that hasn&apos;t been verified yet. Most likely nothing&apos;s wrong - it just hasn&apos;t
					gone through review.
				</List.Item>
				<List.Item>
					<Text span fw={600} c='inherit'>
						1b - Never verified, not deleted, created 30d+ ago:
					</Text>{' '}
					Never verified, and it&apos;s been sitting for a month or more - the &quot;just new&quot;
					explanation no longer holds. Something stalled.
				</List.Item>
				<List.Item>
					<Text span fw={600} c='inherit'>
						2 - Never verified, deleted:
					</Text>{' '}
					Deleted before it was ever verified - likely rejected at intake.
				</List.Item>
				<List.Item>
					<Text span fw={600} c='inherit'>
						3 - Previously verified, deleted:
					</Text>{' '}
					Was live at some point, then staff ended it - likely Inactive or Unaffirming, but check which one
					actually applies.
				</List.Item>
				<List.Item>
					<Text span fw={600} c='inherit'>
						4 - Previously verified, still unpublished, never deleted:
					</Text>{' '}
					Was verified before and is now unpublished, but never deleted - the least amount of signal to go on.
					Sorted oldest-updated first, as the safest place to start.
				</List.Item>
			</List>
			<Text c='dimmed' mt='sm'>
				Click a group below to open its worklist, then use each row&apos;s "Set status" action to assign the
				real reason once you&apos;ve looked into it. No group dictates the answer - they only narrow down
				where to start looking.
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
