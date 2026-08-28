import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { ForgotPasswordModal } from './ForgotPassword'
import { getTRPCMock } from '../lib/getTrpcMock'

export default {
	title: 'Modals/Forgot Password',
	component: ForgotPasswordModal,

	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['user', 'forgotPassword'],
				type: 'mutation',
				response: {
					CodeDeliveryDetails: {
						DeliveryMedium: 'EMAIL',
					},
					$metadata: {},
				},
			})
		)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},

	args: {
		component: Button,
		children: 'Open Forgot Password Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof ForgotPasswordModal>

export const Modal = {}
