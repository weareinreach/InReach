import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { useSession } from 'next-auth/react'
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
} as ComponentMeta<typeof UserAvatar>

const UserAvatarVariant: ComponentStory<typeof UserAvatar> = () => <UserAvatar />

export const UserAvatarFull = UserAvatarVariant.bind({})
export const UserAvatarNoImage = UserAvatarVariant.bind({})
export const UserAvatarNoImageNoEmail = UserAvatarVariant.bind({})
export const UserAvatarNoData = UserAvatarVariant.bind({})
export const UserAvatarLoading = UserAvatarVariant.bind({})

UserAvatarFull.parameters = {
	nextAuthMock: {
		session: 'userPicAuthed',
	},
}
UserAvatarNoImage.parameters = {
	nextAuthMock: {
		session: 'userAuthed',
	},
}

UserAvatarNoImageNoEmail.parameters = {
	nextAuthMock: {
		session: 'userNoPicNoEmailAuthed',
	},
}

UserAvatarLoading.parameters = {
	nextAuthMock: {
		session: 'loading',
	},
}

UserAvatarNoData.parameters = {}
