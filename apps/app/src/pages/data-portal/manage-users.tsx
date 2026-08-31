// apps/app/src/pages/data-portal/manage-users.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { UserTable } from '@weareinreach/ui/components/data-portal/UserTable'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const adminSideNav = {
	heading: 'Admin',
	items: [
		{ label: 'Manage users', href: { pathname: '/data-portal/manage-users' as const }, active: true },
		// No `Team` model or schema exists at all - disabled, not hidden, per Implementation Constraints.
		{ label: 'Manage teams', disabled: true },
		// No equivalent exists anywhere in the codebase; scope still undetermined - see Open Questions.
		{ label: 'Properties manager', disabled: true },
	],
}

const DataPortalManageUsers: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-manage-users')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='admin' sideNav={adminSideNav}>
				<PageHeading title={title} />
				<UserTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalManageUsers.omitGrid = true

export default DataPortalManageUsers

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
