import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { cognito, csrf, providers, signin } from '~ui/mockData/login'

import { LoginBody, LoginModalLauncher } from './Login'

export default {
	title: 'Modals/Login',
	component: LoginModalLauncher,
	parameters: {
		docs: {
			description: {
				component: 'Form will succeed with any email address and a password of "good"',
			},
		},
		msw: [signin(), csrf(), providers(), cognito()],
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		component: Button,
		children: 'Open Login Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof LoginModalLauncher>

export const Modal = {}
export const BodyOnly = {
	parameters: {
		layoutWrapper: 'centeredFullscreen',
	},
	render: () => <LoginBody />,
} satisfies StoryObj<typeof LoginBody>
