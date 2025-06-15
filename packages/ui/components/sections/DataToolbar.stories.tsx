import { type Meta, type StoryObj } from '@storybook/react'

import { DataToolbar } from './DataToolbar'

const meta: Meta<typeof DataToolbar> = {
	title: 'Data Portal/Toolbar',
	component: DataToolbar,
}
export default meta

type Story = StoryObj<typeof DataToolbar>

export const Default: Story = {}
