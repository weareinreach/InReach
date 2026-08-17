import { type Meta, type StoryObj } from '@storybook/nextjs'

import { DataToolbar } from './DataToolbar'

const meta: Meta<typeof DataToolbar> = {
	title: 'Data Portal/Toolbar',
	component: DataToolbar,
}
export default meta

type Story = StoryObj<typeof DataToolbar>

export const Default: Story = {
	args: {
		data: {
			id: 'orgn_MOCKDATATOOLBAR00001',
			name: 'Mock Organization',
			lastUpdated: new Date(2024, 0, 1).toISOString(),
			lastVerified: new Date(2024, 0, 1),
			firstPublished: new Date(2023, 0, 1).toISOString(),
		},
	},
}
