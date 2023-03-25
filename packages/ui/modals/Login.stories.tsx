import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { LoginModalLauncher } from './Login'

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
