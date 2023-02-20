import { Meta, StoryObj } from '@storybook/react'

import { UserAvatar } from './UserAvatar'

export default {
	title: 'Design System/User Avatar',
	component: UserAvatar,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A7051&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: {
		date: {
			control: 'date',
		},
	},
} satisfies Meta<typeof UserAvatar>

type StoryDef = StoryObj<typeof UserAvatar>

export const FullDetails = {
	parameters: {
		nextAuthMock: {
			session: 'userPicAuthed',
		},
	},
} satisfies StoryDef

export const NoImage = {
	parameters: {
		nextAuthMock: {
			session: 'userAuthed',
		},
	},
} satisfies StoryDef

export const WithDate = {
	args: {
		date: new Date(),
	},
} satisfies StoryDef

export const NoData = {
	parameters: {},
} satisfies StoryDef

export const Loading = {
	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
} satisfies StoryDef
