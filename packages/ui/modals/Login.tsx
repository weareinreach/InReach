/* eslint-disable react/no-unescaped-entities */
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Modal,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next'
import { type Route } from 'nextjs-routes'
import { forwardRef, useState } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize, useShake } from '~ui/hooks'

import { ForgotPasswordModal } from './ForgotPassword'
import { ModalTitle } from './ModalTitle'
import { PrivacyStatementModal } from './PrivacyStatement'
import { SignupModalLauncher } from './SignUp'

interface LoginBodyProps {
	activateShake?: () => void
	modalHandler?: {
		readonly open: () => void
		readonly close: () => void
		readonly toggle: () => void
	}
	hideTitle?: boolean
	callbackUrl?: Route
}
export const LoginBody = forwardRef<HTMLDivElement, LoginBodyProps>(
	({ activateShake, modalHandler, hideTitle, callbackUrl }, ref) => {
		const [isLoading, setLoading] = useState(false)
		const variants = useCustomVariant()
		const { t } = useTranslation(['common'])
		const router = useRouter()
		const loginErrors = new Map([[401, t('login.error-username-password')]])
		const LoginSchema = z.object({
			email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
			password: z.string().min(1, t('form-error-password-blank') as string),
		})
		const form = useForm<LoginFormProps>({
			validate: zodResolver(LoginSchema),
			validateInputOnBlur: true,
		})
		const loginHandle = async (email: string, password: string) => {
			try {
				setLoading(true)
				if (!form.isValid()) return
				const result = await signIn('cognito', { email, password, redirect: false })
				if (result?.error) {
					const message = loginErrors.get(result.status)
					form.setFieldError('password', message ?? t('login.error-generic'))
					if (typeof activateShake === 'function') {
						activateShake()
					}
				}
				if (result?.ok) {
					if (modalHandler) {
						modalHandler.close()
					} else if (callbackUrl) {
						router.push(callbackUrl)
					}
				}
			} finally {
				setLoading(false)
			}
		}
		return (
			<Stack align='center' spacing={24} ref={ref}>
				{hideTitle ? null : <Title order={2}>{t('log-in')}</Title>}
				<TextInput
					label={t('words.email')}
					placeholder={t('enter-email-placeholder') as string}
					required
					{...form.getInputProps('email')}
				/>
				<PasswordInput
					label={t('words.password')}
					placeholder={t('enter-password-placeholder') as string}
					required
					{...form.getInputProps('password')}
				/>
				<Button
					// eslint-disable-next-line @typescript-eslint/return-await
					onClick={async () => await loginHandle(form.values.email, form.values.password)}
					variant='primary-icon'
					fullWidth
					type='submit'
					loading={isLoading}
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
		)
	}
)
LoginBody.displayName = 'LoginBody'

export const LoginModalBody = forwardRef<HTMLButtonElement, LoginModalBodyProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const { animateCSS, fireEvent } = useShake({ variant: 1 })
	const { isMobile } = useScreenSize()
	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />
	return (
		<>
			<Modal
				title={modalTitle}
				opened={opened}
				onClose={() => handler.close()}
				className={animateCSS}
				fullScreen={isMobile}
			>
				<LoginBody modalHandler={handler} activateShake={fireEvent} />
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

LoginModalBody.displayName = 'LoginModal'

export const LoginModalLauncher = createPolymorphicComponent<'button', LoginModalBodyProps>(LoginModalBody)

export type LoginModalBodyProps = ButtonProps

type LoginFormProps = {
	email: string
	password: string
}
