// apps/app/src/pages/admin/index.tsx

import { Stack, Tabs, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { type Route, route } from 'nextjs-routes'
import { useCallback, useEffect, useState } from 'react'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
import { DownloadTable } from '@weareinreach/ui/components/data-portal/DownloadTable'
import { OrganizationTable } from '@weareinreach/ui/components/data-portal/OrganizationTable'
import { ReportTable } from '@weareinreach/ui/components/data-portal/ReportTable'
import { ReviewTable } from '@weareinreach/ui/components/data-portal/ReviewTable'
import { UserTable } from '@weareinreach/ui/components/data-portal/UserTable'
import { getServerSideTranslations } from '~app/utils/i18n'

const AdminIndex: NextPage = () => {
	const { t } = useTranslation(['common'])
	const { data: session } = useSession()
	const router = useRouter()
	const { tab } = router.query

	const [activeTab, setActiveTab] = useState<string | null>('organizations')

	// Define permission string literals for readability
	// These must match the actual strings in your generated 'permissions' array
	const PERM_DATAPORTAL_BASIC = 'dataPortalBasic'
	const PERM_DATAPORTAL_MANAGER = 'dataPortalManager'
	const PERM_DATAPORTAL_ADMIN = 'dataPortalAdmin'
	const PERM_ROOT = 'root'

	// Determine access for each tab based on user's permissions
	const canAccessOrganizations = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_BASIC, PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalBasic and above
	})
	const canAccessReviews = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_BASIC, PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalBasic and above
	})
	const canAccessReports = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_BASIC, PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalBasic and above
	})
	const canAccessUsers = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalManager and above
	})
	const canAccessDownloads = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalManager and above
	})

	// Sync activeTab with URL query and handle permission-based fallbacks
	useEffect(() => {
		if (!router.isReady) return

		const requestedTab = (tab as string) || activeTab || 'organizations'
		let targetTab: string | null = requestedTab

		// Verify accessibility
		if (requestedTab === 'organizations' && !canAccessOrganizations) targetTab = null
		if (requestedTab === 'reviews' && !canAccessReviews) targetTab = null
		if (requestedTab === 'reports' && !canAccessReports) targetTab = null
		if (requestedTab === 'users' && !canAccessUsers) targetTab = null
		if (requestedTab === 'downloads' && !canAccessDownloads) targetTab = null

		// Fallback logic if the requested tab isn't allowed
		if (targetTab === null) {
			if (canAccessOrganizations) targetTab = 'organizations'
			else if (canAccessReviews) targetTab = 'reviews'
			else if (canAccessReports) targetTab = 'reports'
			else if (canAccessUsers) targetTab = 'users'
			else if (canAccessDownloads) targetTab = 'downloads'
		}

		if (targetTab !== activeTab) {
			setActiveTab(targetTab)
		}
	}, [
		router.isReady,
		tab,
		canAccessOrganizations,
		canAccessReviews,
		canAccessReports,
		canAccessUsers,
		canAccessDownloads,
		activeTab,
	])

	const handleTabChange = useCallback(
		(val: string | null) => {
			if (!val) return
			setActiveTab(val)
			router.replace({ query: { ...router.query, tab: val } }, undefined, { shallow: true })
		},
		[router]
	)

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Data Admin' })}</title>
			</Head>
			<Stack gap={40} miw='80vw'>
				<Title order={2}>{t('welcome-name', { name: session?.user?.name })}</Title>
				<Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
					<Tabs.List>
						{canAccessOrganizations && (
							<Tabs.Tab value='organizations'>{t('admin.tab-organizations')}</Tabs.Tab>
						)}{' '}
						{canAccessReviews && <Tabs.Tab value='reviews'>{t('admin.tab-reviews', 'Reviews')}</Tabs.Tab>}
						{canAccessReports && <Tabs.Tab value='reports'>{t('admin.tab-reports')}</Tabs.Tab>}
						{canAccessUsers && <Tabs.Tab value='users'>{t('admin.tab-users')}</Tabs.Tab>}
						{canAccessDownloads && <Tabs.Tab value='downloads'>{t('admin.tab-downloads')}</Tabs.Tab>}
					</Tabs.List>

					{activeTab === 'organizations' && canAccessOrganizations && (
						<Tabs.Panel value='organizations' pt='xs'>
							<OrganizationTable />
						</Tabs.Panel>
					)}

					{activeTab === 'reviews' && canAccessReviews && (
						<Tabs.Panel value='reviews' pt='xs'>
							<ReviewTable />
						</Tabs.Panel>
					)}

					{activeTab === 'reports' && canAccessReports && (
						<Tabs.Panel value='reports' pt='xs'>
							<ReportTable />
						</Tabs.Panel>
					)}

					{activeTab === 'users' && canAccessUsers && (
						<Tabs.Panel value='users' pt='xs'>
							<UserTable />
						</Tabs.Panel>
					)}

					{activeTab === 'downloads' && canAccessDownloads && (
						<Tabs.Panel value='downloads' pt='xs'>
							<DownloadTable />
						</Tabs.Panel>
					)}

					{/* Message if no tabs are accessible or selected */}
					{activeTab === null && (
						<Tabs.Panel value='no-access' pt='xs'>
							<div className='text-center py-8'>
								<p className='text-gray-500 text-lg'>{t('admin.no-access-message')}</p>
							</div>
						</Tabs.Panel>
					)}
				</Tabs>
			</Stack>
		</>
	)
}

export default AdminIndex

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const session = await getServerSession(ctx)
	if (!session) {
		const callbackRoute: Route = {
			pathname: '/admin',
		}
		const callbackUrl = Buffer.from(JSON.stringify(callbackRoute)).toString('base64url')
		return {
			redirect: {
				destination: route({ pathname: '/401', query: { callbackUrl } }),
				permanent: false,
			},
		}
	}
	// The getServerSideProps check remains broad to allow access to the /admin route itself
	// if any admin-related permission is present.
	const hasPermissions = checkPermissions({
		session,
		// Use the string literals from your permissions array
		permissions: ['root', 'dataPortalBasic', 'dataPortalAdmin', 'dataPortalManager'],
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
