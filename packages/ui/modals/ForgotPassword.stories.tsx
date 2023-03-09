import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { openForgotPasswordModal } from './ForgotPassword'
import { getTRPCMock } from '../lib/getTrpcMock'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Button onClick={() => openForgotPasswordModal()}>Open Modal</Button>
		</Center>
	)
}

export default {
	title: 'Modals/Forgot Password',
	component: ModalTemplate,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['user', 'resetPassword'],
				type: 'mutation',
				response: {
					CodeDeliveryDetails: {
						DeliveryMedium: 'EMAIL',
					},
				},
			}),
		],
		layout: 'fullscreen',
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
