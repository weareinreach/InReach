import { type Meta, type StoryObj } from '@storybook/react'

import { organization } from '~ui/mockData/organization'
import { review } from '~ui/mockData/review'
import { savedList } from '~ui/mockData/savedList'

import { ActionButtons as ActionButtonsComponent } from './index'

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
			</ActionButtonsComponent.Group>
		</div>
	),
} satisfies StoryObj
