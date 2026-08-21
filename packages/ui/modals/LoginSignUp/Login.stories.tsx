import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { cognito, csrf, providers, signin } from '~ui/mockData/login'

import { LoginBody, LoginModalLauncher } from './index'

export default {
	title: 'Modals/Login',
	component: LoginModalLauncher,

	beforeEach({ msw }) {
		msw.use(signin(), csrf(), providers(), cognito())
	},

	parameters: {
		docs: {
			description: {
				component: 'Form will succeed with any email address and a password of "good"',
			},
		},

		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},

	args: {
		component: Button,
		children: 'Open Login Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof LoginModalLauncher>

export const Modal = {}
export const BodyOnly = {
	parameters: {
		layoutWrapper: 'centeredFullscreen',
	},
	render: () => <LoginBody />,
} satisfies StoryObj<typeof LoginBody>
