import { Text } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/nextjs'

import { DataPortalPageShell } from './DataPortalPageShell'

const meta: Meta<typeof DataPortalPageShell> = {
	title: 'Data Portal/DataPortalPageShell',
	component: DataPortalPageShell,
}
export default meta

type Story = StoryObj<typeof DataPortalPageShell>

const organizationsSideNav = {
	heading: 'Organizations',
	items: [
		{ label: 'Organizations', href: { pathname: '/data-portal/organizations' as const }, active: true },
		{ label: 'Reviews', href: { pathname: '/data-portal/reviews' as const } },
		{ label: 'Reports', href: { pathname: '/data-portal/reports' as const } },
		{ label: 'Downloads', href: { pathname: '/data-portal/downloads' as const } },
	],
}

export const OrganizationsSection: Story = {
	args: {
		activeSection: 'organizations',
		sideNav: organizationsSideNav,
		children: <Text>Page content renders here.</Text>,
	},
}

/** Manage Teams / Properties Manager are visible but disabled - no backend exists for either yet. */
export const AdminSection: Story = {
	args: {
		activeSection: 'admin',
		sideNav: {
			heading: 'Admin',
			items: [
				{ label: 'Manage users', href: { pathname: '/data-portal/manage-users' as const }, active: true },
				{ label: 'Manage teams', disabled: true },
				{ label: 'Properties manager', disabled: true },
			],
		},
		children: <Text>Page content renders here.</Text>,
	},
}

/** System's header-bar link only lights up for a root session - see the parameters on this story. */
export const SystemSectionAsRoot: Story = {
	args: {
		activeSection: 'system',
		sideNav: {
			heading: 'System',
			items: [{ label: 'Quicklink', href: { pathname: '/data-portal/quicklink' as const }, active: true }],
		},
		children: <Text>Page content renders here.</Text>,
	},
	parameters: {
		nextAuthMock: {
			session: 'rootAuthed',
		},
	},
}
