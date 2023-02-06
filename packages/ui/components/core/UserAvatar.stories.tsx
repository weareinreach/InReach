import { Meta } from '@storybook/react'
import React from 'react'

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
} as Meta<typeof UserAvatar>

export const FullDetails = {
	parameters: {
		nextAuthMock: {
			session: 'userPicAuthed',
		},
	},
}

export const NoImage = {
	parameters: {
		nextAuthMock: {
			session: 'userAuthed',
		},
	},
}

export const WithDate = {
	args: {
		date: new Date(),
	},
}

export const NoData = {
	parameters: {},
}

export const Loading = {
	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
}
