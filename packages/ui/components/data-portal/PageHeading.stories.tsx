import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { PageHeading } from './PageHeading'

const meta: Meta<typeof PageHeading> = {
	title: 'Data Portal/PageHeading',
	component: PageHeading,
}
export default meta

type Story = StoryObj<typeof PageHeading>

export const TitleOnly: Story = {
	args: { title: 'Manage users' },
}

export const WithAction: Story = {
	args: {
		title: 'Organizations',
		action: <Button variant='primary'>Add new organization</Button>,
	},
}
