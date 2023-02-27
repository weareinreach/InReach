import { openModal } from '@mantine/modals'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { LoginModal } from './Login'

/** Define the modal to display here. */
const modalToDisplay = LoginModal({
	title: { backToText: 'Example Organization' },
})

const ModalTemplate = () => {
	return <Button onClick={() => openModal(modalToDisplay)}>Open Modal</Button>
}

export default {
	title: 'Modals/Login',
	component: ModalTemplate,
	parameters: {
		msw: [signin(), csrf(), providers(), cognito()],
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
