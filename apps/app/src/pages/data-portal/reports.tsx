// apps/app/src/pages/data-portal/reports.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { ReportTable } from '@weareinreach/ui/components/data-portal/ReportTable'
import {
	BULK_SEARCH_REPLACE_NAV_HELP,
	DOWNLOADS_NAV_HELP,
	LOCATION_PHONE_CLEANUP_HELP,
	MANAGER_AND_ABOVE_PERMISSIONS,
	ORGANIZATIONS_NAV_HELP,
	REPORTS_NAV_HELP,
	REVIEWS_NAV_HELP,
} from '@weareinreach/ui/components/data-portal/SideNav'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{
			label: 'Organizations',
			href: { pathname: '/data-portal/organizations' as const },
			help: ORGANIZATIONS_NAV_HELP,
		},
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const }, help: REVIEWS_NAV_HELP },
		{
			label: 'Reports',
			href: { pathname: '/data-portal/reports' as const },
			active: true,
			help: REPORTS_NAV_HELP,
		},
		{
			label: 'Downloads',
			href: { pathname: '/data-portal/downloads' as const },
			help: DOWNLOADS_NAV_HELP,
			permissions: MANAGER_AND_ABOVE_PERMISSIONS,
		},
		{
			label: 'Bulk Search & Replace',
			href: { pathname: '/data-portal/bulk-search-replace' as const },
			help: BULK_SEARCH_REPLACE_NAV_HELP,
			permissions: MANAGER_AND_ABOVE_PERMISSIONS,
		},
		// TEMPORARY - see location-phone-cleanup.tsx; remove this entry once that review is done.
		{
			label: 'Location Phone Cleanup',
			href: { pathname: '/data-portal/location-phone-cleanup' as const },
			help: LOCATION_PHONE_CLEANUP_HELP,
			permissions: MANAGER_AND_ABOVE_PERMISSIONS,
		},
	],
}

const DataPortalReports: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-reports')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<PageHeading title={title} />
				<ReportTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalReports.omitGrid = true

export default DataPortalReports

// NOTE: tab-visibility is intentionally left at Basic+ here, matching current /admin behavior exactly.
// The underlying `report.forReportsTable`/`report.update` procedures still require dataPortalManager+,
// so a Basic-tier user reaching this page hits the same authorization error they do today - this is a
// known, pre-existing mismatch (see docs/DataPortal/Reports/README.md), not something this relocation
// fixes. The approved fix is deferred to Phase B (see docs/DataPortal/2026-Redesign/UI_elements.md).
export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root'],
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
