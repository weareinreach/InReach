import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { UserAvatar } from './UserAvatar'

export default {
	title: 'Design System/User Avatar',
	component: UserAvatar,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=150%3A6885&t=HciB3O6NOVWxNxNy-0',
		},
	},
} as ComponentMeta<typeof UserAvatar>

const UserAvatarVariant: ComponentStory<typeof UserAvatar> = (args) => (
	<UserAvatar {...args} />
)

export const userAvatarFull = UserAvatarVariant.bind({})
export const userAvatarAndName = UserAvatarVariant.bind({})
export const userAvatarOnly = UserAvatarVariant.bind({})

userAvatarFull.args = {
	avatarSource:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    userName:"Paul Smith",
    subtext:"Service Coordinator"
}
userAvatarAndName.args = {
    avatarSource:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    userName:"Paul Smith",	
}
userAvatarOnly.args = {
}
