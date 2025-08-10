import { type Meta, type StoryObj } from '@storybook/react'

import { InternalNotesDrawer } from './InternalNotesDrawer'

const meta: Meta<typeof InternalNotesDrawer> = {
	title: 'Data Portal/InternalNotesDrawer',
	component: InternalNotesDrawer,
	args: {
		opened: true,
		onClose: () => console.log('Drawer closed'),
	},
}
export default meta

type Story = StoryObj<typeof InternalNotesDrawer>

export const Default: Story = {}
