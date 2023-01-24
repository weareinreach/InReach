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

export const userAvatarFull = UserAvatarVariant.bind({})
export const userAvatarNoImage = UserAvatarVariant.bind({})
export const userAvatarNoImageNoEmail = UserAvatarVariant.bind({})

export const userAvatarNoData = UserAvatarVariant.bind({})
export const userAvatarLoading = UserAvatarVariant.bind({})

userAvatarFull.parameters = {
	nextAuthMock: {
		session: 'userPicAuthed',
	},
}
userAvatarNoImage.parameters = {
	nextAuthMock: {
		session: 'userAuthed',
	},
}

userAvatarNoImageNoEmail.parameters = {
	nextAuthMock: {
		session: 'userNoPicNoEmailAuthed',
	},
}

userAvatarLoading.parameters = {
	nextAuthMock: {
		session: 'loading',
	},
}

userAvatarNoData.parameters = {}
