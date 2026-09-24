// apps/app/src/pages/data-portal/location-phone-cleanup.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { OrganizationTable } from '@weareinreach/ui/components/data-portal/OrganizationTable'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
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

// TEMPORARY: this whole page (and its sidebar entry in the other Organizations-section pages) exists
// only to help staff review orgs affected by the location-phone display fix (see
// orgPhone/query.forContactInfo.handler.ts and OrganizationTable's `locationPhoneCleanupOnly` prop) -
// a multi-location org's main page no longer automatically shows a number that's also linked to one of
// its locations. Safe to delete this page, the sidebar entries pointing to it, and the
// `locationPhoneCleanupOnly`/`needsLocationPhoneCleanup` plumbing behind it once that review is done.
const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{
			label: 'Organizations',
			href: { pathname: '/data-portal/organizations' as const },
			help: ORGANIZATIONS_NAV_HELP,
		},
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const }, help: REVIEWS_NAV_HELP },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const }, help: REPORTS_NAV_HELP },
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
		{
			label: 'Location Phone Cleanup',
			href: { pathname: '/data-portal/location-phone-cleanup' as const },
			active: true,
			help: LOCATION_PHONE_CLEANUP_HELP,
			permissions: MANAGER_AND_ABOVE_PERMISSIONS,
		},
	],
}

const DataPortalLocationPhoneCleanup: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-location-phone-cleanup', 'Location Phone Cleanup')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<PageHeading title={title} />
				<OrganizationTable locationPhoneCleanupOnly />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalLocationPhoneCleanup.omitGrid = true

export default DataPortalLocationPhoneCleanup

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	// Manager and up only - this is a staff cleanup tool, not something every Data Portal user needs.
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
