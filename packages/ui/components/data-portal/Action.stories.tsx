import { type Meta, type StoryObj } from '@storybook/react'

import { Action } from './Action'

const meta: Meta<typeof Action> = {
	title: 'Data Portal/Action',
	component: Action,
}
export default meta

type Story = StoryObj<typeof Action>

export const Default: Story = {}
