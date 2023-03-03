import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { signIn } from 'next-auth/react'

import { Button } from '~ui/components/core'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

export const LoginModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const loginHandle = async (email: string, password: string) => {
		const result = await signIn('cognito', { email, password, redirect: false })
		console.log(result)
	}

	return (
		<>
			<Button onClick={async () => await loginHandle('test@email.com', 'good')}>Sign In Success</Button>
			<Button onClick={async () => await loginHandle('test@email.com', 'bad')}>Sign In Fail</Button>
		</>
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

// export const LoginModal = () =>
// 	({
// 		title: modalTitle,
// 		children: <LoginModalBody />,
// 	} satisfies ModalSettings)

export const openLoginModal = () =>
	openContextModal({
		modal: 'login',
		title: modalTitle,
		innerProps: {},
	})

type LoginModalProps = {
	title: ModalTitleProps
}
