import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { LoginModalBody } from './Login'

export default {
	title: 'Modals/Login',
	component: LoginModalBody,
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
} satisfies Meta<typeof LoginModalBody>

export const Modal = {}
