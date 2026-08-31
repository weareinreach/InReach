// apps/app/src/pages/data-portal/organizations.tsx

import { Stack, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { OrganizationTable } from '@weareinreach/ui/components/data-portal/OrganizationTable'
import { getServerSideTranslations } from '~app/utils/i18n'

const DataPortalOrganizations: NextPage = () => {
	const { t } = useTranslation(['common'])
	const { data: session } = useSession()

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: t('admin.tab-organizations') })}</title>
			</Head>
			<Stack gap={40} miw='80vw'>
				<Title order={2}>{t('welcome-name', { name: session?.user?.name })}</Title>
				<OrganizationTable />
			</Stack>
		</>
	)
}

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
