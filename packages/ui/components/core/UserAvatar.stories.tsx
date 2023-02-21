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
		useLoggedIn: {
			control: false,
		},
		user: {
			control: 'object',
		},
	},
} satisfies Meta<typeof UserAvatar>

type StoryDef = StoryObj<typeof UserAvatar>

export const SessionFullDetails = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
	args: {
		useLoggedIn: true,
	},
} satisfies StoryDef

export const SessionNoImage = {
	parameters: {
		nextAuthMock: {
			session: 'userNoPic',
		},
	},
	args: {
		useLoggedIn: true,
	},
} satisfies StoryDef

export const SessionLoading = {
	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
	args: {
		useLoggedIn: true,
	},
} satisfies StoryDef

export const PassedFullInfo = {
	args: {
		user: {
			name: 'User Name',
			image: 'https://i.pravatar.cc/50?u=1234567',
		},
		subheading: new Date(2023, 1, 1),
	},
} satisfies StoryDef

export const PassedNameNoImage = {
	args: {
		user: {
			name: 'User Name',
		},
		subheading: new Date(2023, 1, 28),
	},
} satisfies StoryDef

export const PassedWithDateNoUser = {
	args: {
		subheading: new Date(2023, 0, 1),
	},
} satisfies StoryDef

export const NoData = {
	parameters: {},
} satisfies StoryDef
