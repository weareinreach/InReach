// apps/app/src/pages/data-portal/downloads.tsx

import { Stack, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { DownloadTable } from '@weareinreach/ui/components/data-portal/DownloadTable'
import { getServerSideTranslations } from '~app/utils/i18n'

const DataPortalDownloads: NextPage = () => {
	const { t } = useTranslation(['common'])
	const { data: session } = useSession()

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: t('admin.tab-downloads') })}</title>
			</Head>
			<Stack gap={40} miw='80vw'>
				<Title order={2}>{t('welcome-name', { name: session?.user?.name })}</Title>
				<DownloadTable />
			</Stack>
		</>
	)
}

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
