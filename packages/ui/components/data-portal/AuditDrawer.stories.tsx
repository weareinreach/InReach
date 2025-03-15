import { type Meta, type StoryObj } from '@storybook/react'

import { AuditDrawer } from './AuditDrawer'

const meta: Meta<typeof AuditDrawer> = {
	title: 'Data Portal/AuditDrawer',
	component: AuditDrawer,
	args: {
		opened: true,
		onClose: () => console.log('Drawer closed'),
	},
}
export default meta

type Story = StoryObj<typeof AuditDrawer>

export const Default: Story = {}
