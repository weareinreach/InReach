import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { UserMenu as UserMenuComponent } from './'

export default {
	title: 'App/Navigation Header Bar/User Menu',
	component: UserMenuComponent,
	parameters: {
		badges: [BADGE.BETA],
	},
} as ComponentMeta<typeof UserMenuComponent>

const Template: ComponentStory<typeof UserMenuComponent> = () => <UserMenuComponent />

export const LoggedOut = Template.bind({})
export const Loading = Template.bind({})
export const LoggedIn = Template.bind({})
export const LoggedInNoPic = Template.bind({})
LoggedOut.parameters = {
	nextAuthMock: {
		session: 'unknown',
	},
}
Loading.parameters = {
	nextAuthMock: {
		session: 'loading',
	},
}
LoggedIn.parameters = {
	nextAuthMock: {
		session: 'userPicAuthed',
	},
}
LoggedInNoPic.parameters = {
	nextAuthMock: {
		session: 'userAuthed',
	},
}
