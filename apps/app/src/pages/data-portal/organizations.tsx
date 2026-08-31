// apps/app/src/pages/data-portal/organizations.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
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
				{/* No action button yet - "Add an organization" needs the createNewQuick adapter work
				    resolved first (slug generation, source selection). See docs/DataPortal/2026-Redesign/
				    UI_elements.md, "Suggested Build Order" step 4. */}
				<PageHeading title={title} />
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx)
	if (!session) {
		const callbackRoute: Route = { pathname: '/data-portal/organizations' }
		const callbackUrl = Buffer.from(JSON.stringify(callbackRoute)).toString('base64url')
		return {
			redirect: {
				destination: route({ pathname: '/401', query: { callbackUrl } }),
				permanent: false,
			},
		}
	}
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
