// apps/app/src/pages/data-portal/reports.tsx

import { Stack, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { ReportTable } from '@weareinreach/ui/components/data-portal/ReportTable'
import { getServerSideTranslations } from '~app/utils/i18n'

const DataPortalReports: NextPage = () => {
	const { t } = useTranslation(['common'])
	const { data: session } = useSession()

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: t('admin.tab-reports') })}</title>
			</Head>
			<Stack gap={40} miw='80vw'>
				<Title order={2}>{t('welcome-name', { name: session?.user?.name })}</Title>
				<ReportTable />
			</Stack>
		</>
	)
}

export default DataPortalReports

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx)
	if (!session) {
		const callbackRoute: Route = { pathname: '/data-portal/reports' }
		const callbackUrl = Buffer.from(JSON.stringify(callbackRoute)).toString('base64url')
		return {
			redirect: {
				destination: route({ pathname: '/401', query: { callbackUrl } }),
				permanent: false,
			},
		}
	}
	// NOTE: tab-visibility is intentionally left at Basic+ here, matching current /admin behavior exactly.
	// The underlying `report.forReportsTable`/`report.update` procedures still require dataPortalManager+,
	// so a Basic-tier user reaching this page hits the same authorization error they do today - this is a
	// known, pre-existing mismatch (see docs/DataPortal/Reports/README.md), not something this relocation
	// fixes. The approved fix is deferred to Phase B (see docs/DataPortal/2026-Redesign/UI_elements.md).
	const hasPermissions = checkPermissions({
		session,
		permissions: ['dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root'],
		has: 'some',
	})
	if (!hasPermissions) {
		return {
			redirect: {
				destination: '/403',
				permanent: false,
			},
		}
	}
	return {
		props: {
			session,
			...(await getServerSideTranslations(ctx.locale, ['common'])),
		},
	}
}
