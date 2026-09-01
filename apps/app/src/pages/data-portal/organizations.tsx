// apps/app/src/pages/data-portal/organizations.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { AddOrgModal } from '@weareinreach/ui/components/data-portal/AddOrgModal'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { OrganizationTable } from '@weareinreach/ui/components/data-portal/OrganizationTable'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{ label: 'Organizations', href: { pathname: '/data-portal/organizations' as const }, active: true },
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const } },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const } },
		{ label: 'Downloads', href: { pathname: '/data-portal/downloads' as const } },
	],
}

const DataPortalOrganizations: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-organizations')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				{/* eslint-disable-next-line i18next/no-literal-string -- Data Portal is internal-only, no i18n needed */}
				<PageHeading title={title} action={<AddOrgModal>Add an organization</AddOrgModal>} />
				<OrganizationTable />
			</DataPortalPageShell>
		</>
	)
}
// Skips BodyGrid's `my={40}` margin + centered-container width, matching Quicklink's existing pattern -
// otherwise this page ends up narrower and offset from every other Data Portal page. See
// docs/DataPortal/2026-Redesign/UI_elements.md, "Implementation Constraints for This Pass."
DataPortalOrganizations.omitGrid = true

export default DataPortalOrganizations

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
			// 'suggestOrg'/'services'/'attribute' are needed here because AddOrgModal renders the shared
			// SuggestOrg form (same fields as the public /suggest page) - without these, every field label
			// falls back to printing its raw translation key instead of real text.
			...(await getServerSideTranslations(locale, ['common', 'suggestOrg', 'services', 'attribute'])),
		},
	}
}
