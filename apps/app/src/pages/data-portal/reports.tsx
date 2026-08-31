// apps/app/src/pages/data-portal/reports.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { ReportTable } from '@weareinreach/ui/components/data-portal/ReportTable'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{ label: 'Organizations', href: { pathname: '/data-portal/organizations' as const } },
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const } },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const }, active: true },
		{ label: 'Downloads', href: { pathname: '/data-portal/downloads' as const } },
	],
}

const DataPortalReports: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: t('admin.tab-reports') })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<ReportTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalReports.omitGrid = true

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
