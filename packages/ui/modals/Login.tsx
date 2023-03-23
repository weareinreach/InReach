/* eslint-disable react/no-unescaped-entities */
import {
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
	type ButtonProps,
	Modal,
	Box,
	createPolymorphicComponent,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { signIn } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'
import { z } from 'zod'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ForgotPasswordModal } from './ForgotPassword'
import { ModalTitle, ModalTitleProps } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'
import { SignupModalLauncher } from './SignUp'

export const LoginModalBody = forwardRef<HTMLButtonElement, LoginModalProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const [loginError, setLoginError] = useState(false)
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	const LoginSchema = z.object({
		email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		password: z.string().min(1, t('form-error-password-blank') as string),
	})
	const form = useForm<LoginFormProps>({
		validate: zodResolver(LoginSchema),
		validateInputOnBlur: true,
	})
	const variants = useCustomVariant()
	const loginHandle = async (email: string, password: string) => {
		if (!form.isValid()) return
		const result = await signIn('cognito', { email, password, redirect: false })
		if (result?.error) console.log(result)
	}

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
				<Stack align='center' spacing={24}>
					<Title order={2}>{t('log-in')}</Title>
					<TextInput
						label={t('email')}
						placeholder={t('enter-email-placeholder') as string}
						required
						{...form.getInputProps('email')}
					/>
					<PasswordInput
						label={t('password')}
						placeholder={t('enter-password-placeholder') as string}
						required
						{...form.getInputProps('password')}
					/>
					<Button
						onClick={async () => await loginHandle(form.values.email, form.values.password)}
						variant='primary-icon'
						fullWidth
					>
						{t('log-in')}
					</Button>
					<Text variant={variants.Text.utility4darkGray}>
						<Trans
							i18nKey='agree-disclaimer'
							values={{
								action: '$t(log-in)',
							}}
							components={{
								link1: (
									<PrivacyStatementModal component={Link} key={0} variant={variants.Link.inheritStyle}>
										Privacy Policy
									</PrivacyStatementModal>
								),
								link2: (
									<Link
										key={1}
										external
										href='https://inreach.org/terms-of-use/'
										variant={variants.Link.inheritStyle}
									>
										Terms of Use
									</Link>
								),
							}}
						/>
					</Text>
					<Stack spacing={0} align='center'>
						<Link external onClick={() => ForgotPasswordModal()}>
							{t('forgot-password')}
						</Link>
						<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
						{/* <Link external onClick={() => openSignUpModal()}>
					{t('dont-have-account')}
				</Link> */}
					</Stack>
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})
LoginModalBody.displayName = 'LoginModal'

export const LoginModal = createPolymorphicComponent<'button', LoginModalProps>(LoginModalBody)

export interface LoginModalProps extends ButtonProps {}

type LoginFormProps = {
	email: string
	password: string
}
