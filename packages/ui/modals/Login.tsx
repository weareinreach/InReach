import { ModalSettings } from '@mantine/modals/lib/context'
import { signIn } from 'next-auth/react'

import { ModalTitle, ModalTitleProps } from './ModalTitle'
import { Button } from '../components/core'

export const LoginModalBody = () => {
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

export const LoginModal = (props: LoginModalProps) =>
	({
		title: <ModalTitle {...props.title} />,
		children: <LoginModalBody />,
	} satisfies ModalSettings)

type LoginModalProps = {
	title: ModalTitleProps
}
