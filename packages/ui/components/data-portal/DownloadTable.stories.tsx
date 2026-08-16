import { type Meta, type StoryObj } from '@storybook/nextjs'

import { downloads } from '~ui/mockData/downloads'

import { DownloadTable } from './DownloadTable'

export default {
	title: 'Data Portal/Tables/CSV Downloads',
	component: DownloadTable,

	beforeEach({ msw }) {
		msw.use(downloads.getAllPublishedOrganizations, downloads.getAllUnpublishedOrganizations)
	},

	parameters: {
		nextAuthMock: {
			session: 'adminAuthed',
		},
	},
} satisfies Meta<typeof DownloadTable>

type Story = StoryObj<typeof DownloadTable>

export const Default: Story = {
	args: {},
}
