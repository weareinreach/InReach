// apps/app/src/pages/data-portal/bulk-search-replace.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { BulkSearchReplaceTable } from '@weareinreach/ui/components/data-portal/BulkSearchReplaceTable'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
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

// Duplicated verbatim in organizations.tsx/reviews.tsx/reports.tsx/downloads.tsx - no shared source of
// truth exists for this array today (see docs/DataPortal/Organizations/README.md's Known Issues); adding
// this page means touching all five, not just this one.
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
			active: true,
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

const DataPortalBulkSearchReplace: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Bulk Search & Replace' })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<PageHeading title='Bulk Search & Replace' />
				<BulkSearchReplaceTable />
			</DataPortalPageShell>
		</>
	)
}
// Matches every other Data Portal page - see organizations.tsx's own comment on this.
DataPortalBulkSearchReplace.omitGrid = true

export default DataPortalBulkSearchReplace

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	// Stricter floor than organizations.tsx's Basic+ - see docs/DataPortal/Organizations/bulk-search-replace.md's
	// Access section for why (population-sensitive content, both text and bulk taxonomy edits).
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
			// 'attribute'/'services' needed for the bulk attribute/tag dialog's real labels.
			...(await getServerSideTranslations(locale, ['common', 'attribute', 'services'])),
		},
	}
}
