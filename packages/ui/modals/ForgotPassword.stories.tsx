import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { ForgotPasswordModal } from './ForgotPassword'
import { getTRPCMock } from '../lib/getTrpcMock'

export default {
	title: 'Modals/Forgot Password',
	component: ForgotPasswordModal,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['user', 'forgotPassword'],
				type: 'mutation',
				response: {
					CodeDeliveryDetails: {
						DeliveryMedium: 'EMAIL',
					},
				},
			}),
		],
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		component: Button,
		children: 'Open Forgot Password Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ForgotPasswordModal>

export const Modal = {}
