import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { Navbar } from './Navbar'

export default {
	title: 'Sections/Navbar',
	component: Navbar,
	render: () => <Navbar />,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=68%3A389&t=QPSEMSrkiRBHDGDr-0',
		},
		nextjs: {
			router: {
				push(url, as, options) {
					const args = { url, as, options }
					action('nextRouter.push')(args)
					action('locale switch')(options?.locale)
					return Promise.resolve(true)
				},
			},
		},
		layout: 'fullscreen',
	},
	//decorators: [StorybookGrid],
} satisfies Meta<typeof Navbar>

type StoryDef = StoryObj<typeof Navbar>

export const LoggedOut = {
	parameters: {
		nextAuthMock: {
			session: 'unknown',
		},
	},
} satisfies StoryDef

export const Loading = {
	parameters: {
		nextAuthMock: {
			session: 'loading',
		},
	},
} satisfies StoryDef

export const LoggedIn = {
	parameters: {
		nextAuthMock: {
			session: 'userPic',
		},
	},
} satisfies StoryDef

export const LoggedInNoPic = {
	parameters: {
		nextAuthMock: {
			session: 'userNoPic',
		},
	},
} satisfies StoryDef
