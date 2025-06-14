import { type Meta, type StoryObj } from '@storybook/react'

import { organization } from '~ui/mockData/organization'
import { review } from '~ui/mockData/review'
import { savedList } from '~ui/mockData/savedList'

import { ActionButtons as ActionButtonsComponent } from './index' // Correctly imports ActionButtons and its sub-components

// 1. Define some mock data for the CSV download story
const MOCK_CSV_DATA = [
	{
		id: 'orgn_001',
		name: 'Acme Corp',
		type: 'Business',
		city: 'Metropolis',
		employees: 150,
		active: true,
		createdAt: new Date('2023-01-15T10:00:00Z'),
	},
	{
		id: 'orgn_002',
		name: 'Gotham University',
		type: 'Education',
		city: 'Gotham City',
		employees: 500,
		active: true,
		createdAt: new Date('2022-03-20T14:30:00Z'),
	},
	{
		id: 'orgn_003',
		name: 'Star Labs',
		type: 'Research',
		city: 'Central City',
		employees: 200,
		active: false,
		createdAt: new Date('2024-02-01T09:15:00Z'),
	},
	{
		id: 'orgn_004',
		name: 'Daily Planet',
		type: 'Media',
		city: 'Metropolis',
		employees: 80,
		active: true,
		createdAt: new Date('2021-11-10T11:45:00Z'),
	},
	{
		id: 'orgn_005',
		name: 'Wayne Enterprises',
		type: 'Conglomerate',
		city: 'Gotham City',
		employees: 1000,
		active: true,
		createdAt: new Date('2020-07-25T16:00:00Z'),
	},
]

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=52%3A1420&t=sleVeGl2lJv7Df18-4',
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [
			organization.getIdFromSlug,
			review.create,
			savedList.getAll,
			savedList.saveItem,
			savedList.createAndSaveItem,
		],
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		nextAuthMock: { session: 'noAuth' },
	},
} satisfies Meta<typeof ActionButtonsComponent>

type StoryDef = StoryObj<typeof ActionButtonsComponent>

export const Save = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: { itemId: 'orgn_1234', itemName: 'Test item name' },
	render: (args) => <ActionButtonsComponent.Save {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Save>

export const SaveLoggedOut = {
	parameters: {
		nextAuthMock: {
			session: 'noAuth',
		},
	},
	args: { itemId: 'orgn_1234', itemName: 'Test item name' },
	render: (args) => <ActionButtonsComponent.Save {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Save>

export const SavedToSingleList = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
		msw: [savedList.isSavedSingle, savedList.deleteItem, organization.getIdFromSlug],
	},
	args: { itemId: 'orgn_1234', itemName: 'Test item name' },
	render: (args) => <ActionButtonsComponent.Save {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Save>
export const SavedToMultipleLists = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
		msw: [savedList.isSavedMultiple, savedList.getAll, savedList.deleteItem, organization.getIdFromSlug],
	},
	args: { itemId: 'orgn_1234', itemName: 'Test item name' },
	render: (args) => <ActionButtonsComponent.Save {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Save>
export const Share = {
	render: (args) => <ActionButtonsComponent.Share {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Share>
export const Print = {
	render: (args) => <ActionButtonsComponent.Print {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Print>
export const Delete = {
	args: {
		iconKey: 'delete',
	},
} satisfies StoryDef
export const Review = {
	render: (args) => <ActionButtonsComponent.Review {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.Review>

// --- New CSVDownload Story ---
export const CSVDownload = {
	parameters: {
		nextAuthMock: {
			session: 'userPicWithPermissions', // Assuming a session with necessary permissions ('root' or 'org_data_export_published')
		},
	},
	args: {
		label: 'Download All Orgs CSV',
		fileName: 'all_organizations_export',
		permissionKey: 'org_data_export_published', // Match a permission that your mock session has
		// Mock the useQueryHook to simulate a tRPC query result for Storybook
		useQueryHook: () => ({
			data: MOCK_CSV_DATA, // Your mock data defined above
			isLoading: false,
			refetch: () => {
				// This refetch function will be called when the button is clicked in Storybook
				console.log('Mock refetch for CSV download called. Data ready.')
				// In a real Storybook setup, you might trigger a Storybook action or
				// update an arg to show mock loading/success states.
				return Promise.resolve({ data: MOCK_CSV_DATA, isLoading: false, refetch: () => {}, error: null })
			},
			error: null,
			// Add other UseQueryResult properties if your component strictly depends on them
			isFetching: false,
			isStale: false,
			isSuccess: true,
			status: 'success',
			isError: false,
			failureCount: 0,
			isFetched: true,
			isFetchedAfterMount: true,
			isPaused: false,
			isPending: false,
			isPlaceholderData: false,
			isRefetching: false,
			isInitialLoading: false,
			fetchStatus: 'idle',
		}),
	},
	render: (args) => <ActionButtonsComponent.CSVDownload {...args} />,
} satisfies StoryObj<typeof ActionButtonsComponent.CSVDownload>

export const More = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		containerWidth: 100,
	},
	argTypes: {
		containerWidth: {
			control: 'range',
			min: 1,
			max: 100,
			step: 5,
		},
	},
	// @ts-expect-error Stop yelling about the `containerWidth` prop.
	render: ({ containerWidth }: { containerWidth: number }) => (
		<div style={{ width: `${containerWidth}%` }}>
			<ActionButtonsComponent.Group>
				<ActionButtonsComponent.Save data-targetid='save' {...Save.args} />
				<ActionButtonsComponent.Share data-targetid='share' />
				<ActionButtonsComponent.Review data-targetid='review' />
				<ActionButtonsComponent.Print data-targetid='print' />
				{/* Add the CSVDownload button to the More menu if desired */}
				{/* <ActionButtonsComponent.CSVDownload {...CSVDownload.args} /> */}
			</ActionButtonsComponent.Group>
		</div>
	),
} satisfies StoryObj
