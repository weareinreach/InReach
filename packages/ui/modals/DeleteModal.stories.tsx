import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openDeleteAccountModal } from './DeleteModal'

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Button onClick={openDeleteAccountModal}>Open Modal</Button>
		</Center>
	)
}

export default {
	title: 'Modals/Delete Account',
	component: ModalTemplate,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
