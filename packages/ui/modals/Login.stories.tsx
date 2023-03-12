import { Center, Title, Stack } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { openLoginModal } from './Login'

/** Define the modal to display here. */
// const modalToDisplay = LoginModal()

const ModalTemplate = () => {
	return (
		<Center maw='100vw' h='100vh'>
			<Stack spacing={32}>
				<Button onClick={() => openLoginModal()}>Open Modal</Button>
				<Title order={3}>{`Form will succeed with any email address and a password of "good"`}</Title>
			</Stack>
		</Center>
	)
}

export default {
	title: 'Modals/Login',
	component: ModalTemplate,
	parameters: {
		msw: [signin(), csrf(), providers(), cognito()],
		layout: 'fullscreen',
	},
} satisfies Meta<typeof ModalTemplate>

export const Modal = {}
