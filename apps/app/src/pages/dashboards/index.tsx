// apps/app/src/pages/dashboards/index.tsx

import { Card, SimpleGrid, Text, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { Icon } from '@weareinreach/ui/icon'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

// First entry in what's meant to grow into several dashboards (some gated, some eventually public) - see
// docs/Dashboards/README.md. Deliberately top-level (`/dashboards`, not nested
// under `/data-portal/`), since a future public dashboard would read oddly under an internal-tool prefix.
const DASHBOARDS = [
	{
		href: '/dashboards/unpublished-status',
		title: 'Unpublished Status',
		description: 'Triage organizations that need an unpublished reason set.',
		icon: 'carbon:tag',
	},
] as const

const DashboardsIndex: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Dashboards' })}</title>
			</Head>
			{/* eslint-disable-next-line i18next/no-literal-string -- internal-only, gated page */}
			<Title order={2}>Dashboards</Title>
			<SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing='lg' mt='lg'>
				{DASHBOARDS.map((dashboard) => (
					<Card
						key={dashboard.href}
						component={Link}
						href={{ pathname: dashboard.href }}
						withBorder
						padding='xl'
						radius='lg'
						style={{ textAlign: 'center' }}
					>
						<Icon icon={dashboard.icon} height={48} width={48} />
						<Text fw={600} mt='md'>
							{dashboard.title}
						</Text>
						<Text size='sm' c='dimmed' mt={4}>
							{dashboard.description}
						</Text>
					</Card>
				))}
			</SimpleGrid>
		</>
	)
}

export default DashboardsIndex

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
