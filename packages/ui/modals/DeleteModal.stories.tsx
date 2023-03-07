import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openDeleteModalBody } from './DeleteModal'

const ModalTemplate = () => {
	return <Button onClick={openDeleteModalBody}>Open Modal</Button>
}

export default {
	title: 'Modals/Delete Modal',
	component: ModalTemplate,
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
