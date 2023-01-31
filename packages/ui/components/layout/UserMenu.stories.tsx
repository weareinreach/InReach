import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { UserMenu as UserMenuComponent } from './'

export default {
	title: 'App/Navigation Header Bar/User Menu',
	component: UserMenuComponent,
	parameters: {
		badges: [BADGE.BETA],
	},
} as Meta<typeof UserMenuComponent>

export const LoggedOut = {
	render: () => <UserMenuComponent />,

	parameters: {
		nextAuthMock: {
			session: 'unknown',
		},
	},
}

export const Loading = {
	render: () => <UserMenuComponent />,

	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
}

export const LoggedIn = {
	render: () => <UserMenuComponent />,

	parameters: {
		nextAuthMock: {
			session: 'userPicAuthed',
		},
	},
}

export const LoggedInNoPic = {
	render: () => <UserMenuComponent />,

	parameters: {
		nextAuthMock: {
			session: 'userAuthed',
		},
	},
}
