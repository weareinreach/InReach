import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openLoginModal } from './Login'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

const ModalTemplate = () => {
	return <Button onClick={openLoginModal}>Open Modal</Button>
}

export default {
	title: 'Modals/Sign Up',
	component: ModalTemplate,
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
