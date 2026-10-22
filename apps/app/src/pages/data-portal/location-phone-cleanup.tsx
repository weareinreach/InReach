// apps/app/src/pages/data-portal/location-phone-cleanup.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { LocationContactReviewTable } from '@weareinreach/ui/components/data-portal/LocationContactReviewTable'
import { organizationsSideNav } from '@weareinreach/ui/components/data-portal/organizationsSideNav'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

// TEMPORARY: this whole page (and its sidebar entry in the other Organizations-section pages) exists only for
// data managers to work through the location-vs-organization contact cleanup - the phones, emails, websites
// and social media the 2026-10-19_location-contact-cleanup data migration couldn't decide on by itself (see
// LocationContactReviewTable and the locationContactReview API router). Kept at its original
// location-phone-cleanup URL. Safe to delete this page, its sidebar entry in organizationsSideNav.ts, the
// table and the router once the list is empty.
const DataPortalLocationPhoneCleanup: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-contact-cleanup', 'Contact Cleanup')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav('Contact Cleanup')}>
				<PageHeading title={title} />
				<LocationContactReviewTable />
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
