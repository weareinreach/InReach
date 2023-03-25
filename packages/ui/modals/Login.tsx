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
import { DefaultTFuncReturn } from 'i18next'
import { signIn } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'
import { z } from 'zod'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ForgotPasswordModal } from './ForgotPassword'
import { ModalTitle } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'
import { SignupModalLauncher } from './SignUp'

export const LoginModalBody = forwardRef<HTMLButtonElement, LoginModalBodyProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const [loginError, setLoginError] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | DefaultTFuncReturn | undefined>()
	const [opened, handler] = useDisclosure(false)

	const loginErrors = new Map([[401, t('login.error-username-password')]])

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	const LoginSchema = z.object({
		email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		password: z.string().min(1, t('form-error-password-blank') as string),
	})
	const form = useForm<LoginFormProps>({
		validate: zodResolver(LoginSchema),
		validateInputOnBlur: true,
		initialValues: {
			email: '',
			password: '',
		},
	})
	const variants = useCustomVariant()
	const loginHandle = async (email: string, password: string) => {
		if (!form.isValid()) return
		const result = await signIn('cognito', { email, password, redirect: false })
		if (result?.error) {
			setLoginError(true)
			const message = loginErrors.get(result.status)
			setErrorMessage(message ?? t('login.error-generic'))
		}
		if (result?.ok) {
			handler.close()
		}
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
						error={loginError && errorMessage}
						{...form.getInputProps('password')}
					/>
					<Button
						onClick={async () => await loginHandle(form.values.email, form.values.password)}
						variant='primary-icon'
						fullWidth
						type='submit'
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
						<ForgotPasswordModal component={Link}>{t('forgot-password')}</ForgotPasswordModal>
						<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
					</Stack>
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

LoginModalBody.displayName = 'LoginModal'

export const LoginModalLauncher = createPolymorphicComponent<'button', LoginModalBodyProps>(LoginModalBody)

export interface LoginModalBodyProps extends ButtonProps {}

type LoginFormProps = {
	email: string
	password: string
}
