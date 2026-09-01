import { type Meta, type StoryObj } from '@storybook/nextjs'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { trpc as api } from '~ui/lib/trpcClient'

import { CsvDownload } from './CsvDownload' // Adjust the import path as necessary

// This story never passed useMutationHook - it's a required prop, so the button crashed calling
// `useMutationHook()` on undefined. Wire up the real tRPC mutation hook (as real usage in
// DownloadTable.tsx does) backed by an MSW mock.
const getAllPublishedForCSV = getTRPCMock({
	path: ['csvDownload', 'getAllPublishedForCSV'],
	type: 'mutation',
	response: [
		{
			id: 'orgn_MOCKCSVDOWNLOAD0001',
			'Organization Name': 'Mock Organization',
			'Organization Website': 'https://example.org',
			'InReach Slug': 'mock-organization',
			'InReach Edit URL': '/dataportal/organization/orgn_MOCKCSVDOWNLOAD0001',
			createdAt: new Date(2024, 0, 1),
			updatedAt: new Date(2024, 0, 1),
			lastVerified: new Date(2024, 0, 1),
			status: 'Published',
			deleted: false,
			countryCode: 'US',
		},
	],
})

export default {
	title: 'Data Portal/Components/CsvDownload',
	component: CsvDownload,
	parameters: {
		layout: 'centered',
		nextAuthMock: {
			session: 'adminAuthed',
		},
	},

	beforeEach({ msw }) {
		msw.use(getAllPublishedForCSV)
	},
} satisfies Meta<typeof CsvDownload>

type Story = StoryObj<typeof CsvDownload>

export const BasicDownloadButton: Story = {
	args: {
		label: 'Download Basic Data',
		fileName: 'basic_data_export',
		permissionKey: 'dataPortalManager',
		useMutationHook: () => api.csvDownload.getAllPublishedForCSV.useMutation(),
	},
}
