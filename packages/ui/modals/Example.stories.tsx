import { openModal } from '@mantine/modals'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { ExampleModal } from './Example'

/** Define the modal to display here. */
const modalToDisplay = ExampleModal({
	body: { text: 'Example badge text' },
	title: {
		breadcrumb: {
			option: 'back',
			backTo: 'dynamicText',
			backToText: 'Example Organization',
		},
		icons: ['share', 'save'],
	},
})

const ModalTemplate = () => {
	return <Button onClick={() => openModal(modalToDisplay)}>Open Modal</Button>
}

export default {
	title: 'Modals/Example',
	component: ModalTemplate,
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
