import { type Meta, type StoryObj } from '@storybook/react'

import { CsvDownload } from './CsvDownload' // Adjust the import path as necessary

export default {
	title: 'Data Portal/Components/CsvDownload',
	component: CsvDownload,
	parameters: {
		layout: 'centered',
		nextAuthMock: {
			session: 'adminAuthed',
		},
	},
} satisfies Meta<typeof CsvDownload>

type Story = StoryObj<typeof CsvDownload>

export const BasicDownloadButton: Story = {
	args: {
		label: 'Download Basic Data',
		fileName: 'basic_data_export',
		permissionKey: 'dataPortalManager',
	},
}
