import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { SignupModalLauncher } from './SignUp'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

// const ModalTemplate = () => {
// 	return (
// 		<Center maw='100vw' h='100vh'>
// 			<Button onClick={openLoginModal}>Open Modal</Button>
// 		</Center>
// 	)
// }

export default {
	title: 'Modals/Sign Up',
	component: SignupModalLauncher,
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		component: Button,
		children: 'Launch Modal',
	},
} satisfies Meta<typeof SignupModalLauncher>

export const Modal = {}
