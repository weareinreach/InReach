import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { DeleteModal } from './DeleteModal'
import { getTRPCMock } from '../lib/getTrpcMock'

export default {
	title: 'Modals/Delete Account',
	component: DeleteModal,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
		msw: [
			getTRPCMock({
				path: ['user', 'deleteAccount'],
				type: 'mutation',
				response: true,
			}),
		],
	},
	args: {
		component: Button,
		children: 'Open Delete Account Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof DeleteModal>

export const Modal = {}
