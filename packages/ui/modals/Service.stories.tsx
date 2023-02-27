import { openModal } from '@mantine/modals'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { mockServiceData } from '~ui/mockData/serviceModal'

import { ServiceModal, ServiceModalProps } from './Service'

/** Define the modal to display here. */
const modalToDisplay = ServiceModal({
	body: { serviceId: 'svce_KLSDJFKLSJDF' },
	title: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Example Organization',
		},
		icons: ['share', 'save'],
	},
})

const ModalTemplate = () => <Button onClick={() => openModal(modalToDisplay)}>Open Modal</Button>

export default {
	title: 'Modals/Service Info',
	component: ModalTemplate,
	parameters: {
		msw: [
			getTRPCMock({
				path: ['service', 'byId'],
				type: 'query',
				response: mockServiceData,
			}),
		],
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=215%3A10190&t=ImTreJvyGV7TGV1z-4',
		},
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
