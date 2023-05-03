import { type Meta } from '@storybook/react'

import { UserMenu as UserMenuComponent } from '.'

export default {
	title: 'Sections/Navbar/User Menu',
	component: UserMenuComponent,
} as Meta<typeof UserMenuComponent>

export const LoggedOut = {
	parameters: {
		nextAuthMock: {
			session: 'unknown',
		},
	},
}

export const Loading = {
	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
}

export const LoggedIn = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
}

export const LoggedInNoPic = {
	parameters: {
		nextAuthMock: {
			session: 'userNoPic',
		},
	},
}
