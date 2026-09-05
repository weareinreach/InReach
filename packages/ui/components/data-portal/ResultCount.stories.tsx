import { type Meta, type StoryObj } from '@storybook/nextjs'

import { ResultCount } from './ResultCount'

const meta: Meta<typeof ResultCount> = {
	title: 'Data Portal/ResultCount',
	component: ResultCount,
}
export default meta

type Story = StoryObj<typeof ResultCount>

export const Default: Story = {
	args: { count: 1914 },
}

export const CustomLabel: Story = {
	args: { count: 625, label: 'Users' },
}

export const Zero: Story = {
	args: { count: 0 },
}
