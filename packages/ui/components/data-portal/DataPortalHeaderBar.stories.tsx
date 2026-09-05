import { type Meta, type StoryObj } from '@storybook/nextjs'

import { DataPortalHeaderBar } from './DataPortalHeaderBar'

const meta: Meta<typeof DataPortalHeaderBar> = {
	title: 'Data Portal/DataPortalHeaderBar',
	component: DataPortalHeaderBar,
}
export default meta

type Story = StoryObj<typeof DataPortalHeaderBar>

/** Tasks has no destination page in this phase, so it always renders disabled regardless of section. */
export const OrganizationsActive: Story = {
	args: { activeSection: 'organizations' },
}

export const AdminActive: Story = {
	args: { activeSection: 'admin' },
}

/** System is grayed out by default - root-only, per Implementation Constraints. */
export const SystemDisabledForNonRoot: Story = {
	args: { activeSection: 'organizations', systemEnabled: false },
}

/** A root session sees System as a real, clickable section. */
export const SystemEnabledForRoot: Story = {
	args: { activeSection: 'system', systemEnabled: true },
}
