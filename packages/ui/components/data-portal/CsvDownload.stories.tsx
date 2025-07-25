import { type Meta, type StoryObj } from '@storybook/react'

import { CsvDownload } from './CsvDownload' // Adjust the import path as necessary

const mockUseMutationHook = () =>
	({
		mutate: (input: unknown) => {
			console.log('Simulating CSV download for input:', input)
			console.log('A mock download action would occur here.')
		},
		isLoading: false,
	}) as unknown
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
