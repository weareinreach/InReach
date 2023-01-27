import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { UserAvatar } from './UserAvatar'

export default {
	title: 'Design System/User Avatar',
	component: UserAvatar,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A6885&t=HciB3O6NOVWxNxNy-0',
		},
	},
	argTypes: {
		date: {
			control: 'date',
		},
	},
} as ComponentMeta<typeof UserAvatar>

const UserAvatarVariant: ComponentStory<typeof UserAvatar> = (args) => <UserAvatar {...args} />

export const FullDetails = UserAvatarVariant.bind({})
export const NoImage = UserAvatarVariant.bind({})
export const WithDate = UserAvatarVariant.bind({})
export const NoData = UserAvatarVariant.bind({})
export const Loading = UserAvatarVariant.bind({})

FullDetails.parameters = {
	nextAuthMock: {
		session: 'userPicAuthed',
	},
}
NoImage.parameters = {
	nextAuthMock: {
		session: 'userAuthed',
	},
}

WithDate.args = {
	date: new Date(),
}

Loading.parameters = {
	nextAuthMock: {
		session: 'loading',
	},
}

NoData.parameters = {}
