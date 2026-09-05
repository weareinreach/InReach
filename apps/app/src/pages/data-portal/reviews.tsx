// apps/app/src/pages/data-portal/reviews.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { ReviewTable } from '@weareinreach/ui/components/data-portal/ReviewTable'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{ label: 'Organizations', href: { pathname: '/data-portal/organizations' as const } },
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const }, active: true },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const } },
		{ label: 'Downloads', href: { pathname: '/data-portal/downloads' as const } },
		{ label: 'Bulk Search & Replace', href: { pathname: '/data-portal/bulk-search-replace' as const } },
	],
}

const DataPortalReviews: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-reviews', 'Reviews')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<PageHeading title={title} />
				<ReviewTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalReviews.omitGrid = true

export default DataPortalReviews

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
