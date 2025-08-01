// apps/app/src/pages/admin/index.tsx

import { Group, Stack, Tabs, Title } from '@mantine/core'
import { type GetServerSideProps, type NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { type Route, route } from 'nextjs-routes'
import { useEffect, useState } from 'react'

import { checkPermissions, getServerSession } from '@weareinreach/auth'
// Import the 'permissions' array (which is a runtime value)
import { permissions as ALL_PERMISSIONS } from '@weareinreach/db/generated/permission' // Renamed to ALL_PERMISSIONS for clarity
import { DownloadTable } from '@weareinreach/ui/components/data-portal/DownloadTable'
import { OrganizationTable } from '@weareinreach/ui/components/data-portal/OrganizationTable'
import { UserTable } from '@weareinreach/ui/components/data-portal/UserTable'
import { getServerSideTranslations } from '~app/utils/i18n'
import { trpc as api } from '~ui/lib/trpcClient'

const AdminIndex: NextPage = () => {
	const { t } = useTranslation(['common'])
	const { data: session } = useSession()
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
	const canAccessUsers = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalManager and above
	})
	const canAccessDownloads = checkPermissions({
		session,
		permissions: [PERM_DATAPORTAL_MANAGER, PERM_DATAPORTAL_ADMIN, PERM_ROOT],
		has: 'some', // dataPortalManager and above
	})

	// Effect to manage activeTab based on permissions
	useEffect(() => {
		// If the current active tab is not accessible, switch to the first accessible one
		if (activeTab === 'organizations' && !canAccessOrganizations) {
			if (canAccessUsers) {
				setActiveTab('users')
			} else if (canAccessDownloads) {
				setActiveTab('downloads')
			} else {
				setActiveTab(null) // No tabs accessible
			}
		} else if (activeTab === 'users' && !canAccessUsers) {
			if (canAccessOrganizations) {
				setActiveTab('organizations')
			} else if (canAccessDownloads) {
				setActiveTab('downloads')
			} else {
				setActiveTab(null) // No tabs accessible
			}
		} else if (activeTab === 'downloads' && !canAccessDownloads) {
			if (canAccessOrganizations) {
				setActiveTab('organizations')
			} else if (canAccessUsers) {
				setActiveTab('users')
			} else {
				setActiveTab(null) // No tabs accessible
			}
		}
		// If no tabs are accessible at all, ensure activeTab is null
		if (!canAccessOrganizations && !canAccessUsers && !canAccessDownloads && activeTab !== null) {
			setActiveTab(null)
		}
	}, [activeTab, canAccessOrganizations, canAccessUsers, canAccessDownloads])
	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Data Admin' })}</title>
			</Head>
			<Stack spacing={40} miw='80vw'>
				<Title order={2}>{t('welcome-name', { name: session?.user?.name })}</Title>
				<Tabs value={activeTab} onTabChange={setActiveTab} keepMounted={false}>
					<Tabs.List>
						{canAccessOrganizations && (
							<Tabs.Tab value='organizations'>{t('admin.tab-organizations')}</Tabs.Tab>
						)}
						{canAccessUsers && <Tabs.Tab value='users'>{t('admin.tab-users')}</Tabs.Tab>}
						{canAccessDownloads && <Tabs.Tab value='downloads'>{t('admin.tab-downloads')}</Tabs.Tab>}
					</Tabs.List>

					{activeTab === 'organizations' && canAccessOrganizations && (
						<Tabs.Panel value='organizations' pt='xs'>
							<OrganizationTable />
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
								<p className='text-gray-500 text-lg'>
									You do not have permission to access any sections of the admin dashboard.
								</p>
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
