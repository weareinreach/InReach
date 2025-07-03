import { type Meta, type StoryObj } from '@storybook/react'

import { Activity } from './Activity'

const meta: Meta<typeof Activity> = {
	title: 'Data Portal/Activity',
	component: Activity,
}
export default meta

type Story = StoryObj<typeof Activity>

export const Default: Story = {}
