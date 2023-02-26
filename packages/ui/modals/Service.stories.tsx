import { openModal } from '@mantine/modals'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { mockServiceData } from '~ui/mockData/serviceModal'

import { ServiceModal } from './Service'

/** Define the modal to display here. */
const modalToDisplay = ServiceModal({
	body: { serviceId: 'Example badge text' },
	title: { backToText: 'Example Organization' },
})

const ModalTemplate = () => {
	return <Button onClick={() => openModal(modalToDisplay)}>Open Modal</Button>
}

export default {
	title: 'Modals/Service',
	component: ModalTemplate,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['service', 'byId'],
				type: 'query',
				response: mockServiceData,
			}),
		],
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
