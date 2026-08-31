import { type Meta, type StoryObj } from '@storybook/nextjs'

import { SideNav } from './SideNav'

const meta: Meta<typeof SideNav> = {
	title: 'Data Portal/SideNav',
	component: SideNav,
}
export default meta

type Story = StoryObj<typeof SideNav>

export const Organizations: Story = {
	args: {
		heading: 'Organizations',
		items: [
			{ label: 'Organizations', href: { pathname: '/data-portal/organizations' }, active: true },
			{ label: 'Reviews', href: { pathname: '/data-portal/reviews' } },
			{ label: 'Reports', href: { pathname: '/data-portal/reports' } },
			{ label: 'Downloads', href: { pathname: '/data-portal/downloads' } },
		],
	},
}

/** Manage Teams and Properties Manager have no backend yet - visible, disabled, never hidden. */
export const Admin: Story = {
	args: {
		heading: 'Admin',
		items: [
			{ label: 'Manage users', href: { pathname: '/data-portal/manage-users' }, active: true },
			{ label: 'Manage teams', disabled: true },
			{ label: 'Properties manager', disabled: true },
		],
	},
}

export const System: Story = {
	args: {
		heading: 'System',
		items: [{ label: 'Quicklink', href: { pathname: '/data-portal/quicklink' }, active: true }],
	},
}

/** Tasks has no destination pages at all in this phase - every item renders disabled. */
export const Tasks: Story = {
	args: {
		heading: 'Tasks',
		items: [
			{ label: 'Team task', disabled: true },
			{ label: 'Unassigned tasks', disabled: true },
			{ label: 'Approve changes', disabled: true },
			{ label: 'Review suggestions', disabled: true },
			{ label: 'Pending claims', disabled: true },
		],
	},
}
