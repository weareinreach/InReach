import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openLoginModal } from './Login'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Button onClick={openLoginModal}>Open Modal</Button>
		</Center>
	)
}

export default {
	title: 'Modals/Sign Up',
	component: ModalTemplate,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
