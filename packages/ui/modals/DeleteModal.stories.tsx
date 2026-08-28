import { type Meta } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'

import { DeleteModal } from './DeleteModal'
import { getTRPCMock } from '../lib/getTrpcMock'

export default {
	title: 'Modals/Delete Account',
	component: DeleteModal,

	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['user', 'deleteAccount'],
				type: 'mutation',
				response: true,
			})
		)
	},

	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},

	args: {
		component: Button,
		children: 'Open Delete Account Modal',
		variant: 'primary',
	},
} satisfies Meta<typeof DeleteModal>

export const Modal = {}
