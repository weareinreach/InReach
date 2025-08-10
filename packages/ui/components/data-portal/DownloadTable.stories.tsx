import { type Meta, type StoryObj } from '@storybook/react'

import { downloads } from '~ui/mockData/downloads'

import { DownloadTable } from './DownloadTable'

export default {
	title: 'Data Portal/Tables/CSV Downloads',
	component: DownloadTable,
	parameters: {
		msw: [downloads.getAllPublishedOrganizations, downloads.getAllUnpublishedOrganizations],
		nextAuthMock: {
			session: 'adminAuthed',
		},
	},
} satisfies Meta<typeof DownloadTable>

type Story = StoryObj<typeof DownloadTable>

export const Default: Story = {
	args: {},
}
