import { Center } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { openPrivacyStatementModal } from './PrivacyStatement'

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Button onClick={openPrivacyStatementModal}>Open Modal</Button>
		</Center>
	)
}

export default {
	title: 'Modals/Privacy Statement',
	component: ModalTemplate,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
