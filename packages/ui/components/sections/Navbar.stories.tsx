import { Meta } from '@storybook/react'

import { Navbar } from './Navbar'
import { StorybookGrid } from '../../layouts/BodyGrid'

export default {
	title: 'App/Navigation Header Bar/Navbar',
	component: Navbar,
	render: () => <Navbar />,
	parameters: {
		layout: 'fullscreen',
	},
	//decorators: [StorybookGrid],
} satisfies Meta<typeof Navbar>

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
