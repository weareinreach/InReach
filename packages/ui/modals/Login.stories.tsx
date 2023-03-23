import { Title, Stack } from '@mantine/core'
import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'
import { csrf, providers, signin, cognito } from '~ui/mockData/login'

import { LoginModal } from './Login'

// const ModalTemplate = () => {
// 	return (
// 		<Center maw='100vw' h='100vh'>
// 			<Stack spacing={32}>
// 				<Button onClick={() => openLoginModal()}>Open Modal</Button>
// 				<Title order={3}>{`Form will succeed with any email address and a password of "good"`}</Title>
// 			</Stack>
// 		</Center>
// 	)
// }

export default {
	title: 'Modals/Login',
	component: LoginModal,
	parameters: {
		docs: {
			description: {
				component: 'Form will succeed with any email address and a password of "good"',
			},
		},
		msw: [signin(), csrf(), providers(), cognito()],
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		component: Button,
		children: 'Open Login Modal',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof LoginModal>

export const Modal = {}
