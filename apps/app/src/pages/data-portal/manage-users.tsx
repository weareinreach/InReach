// apps/app/src/pages/data-portal/manage-users.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
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

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: t('admin.tab-manage-users') })}</title>
			</Head>
			<DataPortalPageShell activeSection='admin' sideNav={adminSideNav}>
				<UserTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalManageUsers.omitGrid = true

export default DataPortalManageUsers

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx)
	if (!session) {
		const callbackRoute: Route = { pathname: '/data-portal/manage-users' }
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
		permissions: ['dataPortalManager', 'dataPortalAdmin', 'root'],
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
