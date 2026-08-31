// apps/app/src/pages/data-portal/downloads.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { DownloadTable } from '@weareinreach/ui/components/data-portal/DownloadTable'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{ label: 'Organizations', href: { pathname: '/data-portal/organizations' as const } },
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const } },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const } },
		{ label: 'Downloads', href: { pathname: '/data-portal/downloads' as const }, active: true },
	],
}

const DataPortalDownloads: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = t('admin.tab-downloads')

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav}>
				<PageHeading title={title} />
				<DownloadTable />
			</DataPortalPageShell>
		</>
	)
}
// See organizations.tsx for why every Data Portal page sets this.
DataPortalDownloads.omitGrid = true

export default DataPortalDownloads

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx)
	if (!session) {
		const callbackRoute: Route = { pathname: '/data-portal/downloads' }
		const callbackUrl = Buffer.from(JSON.stringify(callbackRoute)).toString('base64url')
		return {
			redirect: {
				destination: route({ pathname: '/401', query: { callbackUrl } }),
				permanent: false,
			},
		}
	}
	// Corrected to Manager+ here (the old /admin tab required Admin+ in the UI while the underlying
	// csvDownload procedures have only ever required dataPortalManager+) - approved as part of this
	// relocation since it's a frontend-only gate change, not new backend functionality. See
	// docs/DataPortal/2026-Redesign/UI_elements.md.
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
