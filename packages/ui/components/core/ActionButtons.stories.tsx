import { type Meta, type StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { organization } from '~ui/mockData/organization'
import { review } from '~ui/mockData/review'
import { savedList } from '~ui/mockData/savedList'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

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
	},
} satisfies Meta<typeof ActionButtonsComponent>

type StoryDef = StoryObj<typeof ActionButtonsComponent>

export const Save = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		iconKey: 'save',
	},
}

export const SaveLoggedOut = {
	parameters: {
		nextAuthMock: {
			session: 'noAuth',
		},
	},
	args: {
		iconKey: 'save',
	},
} satisfies StoryDef

export const SavedToSingleList = {
	args: {
		iconKey: 'save',
	},
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
		msw: [savedList.isSavedSingle, savedList.deleteItem, organization.getIdFromSlug],
	},
} satisfies StoryDef
export const SavedToMultipleLists = {
	args: {
		iconKey: 'save',
	},
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
		msw: [savedList.isSavedMultiple, savedList.getAll, savedList.deleteItem, organization.getIdFromSlug],
	},
} satisfies StoryDef
export const Share = {
	args: {
		iconKey: 'share',
	},
} satisfies StoryDef
export const Print = {
	args: {
		iconKey: 'print',
	},
} satisfies StoryDef
export const Delete = {
	args: {
		iconKey: 'delete',
	},
} satisfies StoryDef
export const Review = {
	args: {
		iconKey: 'review',
	},
} satisfies StoryDef
export const More = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		iconKey: 'more',
	},
} satisfies StoryDef
