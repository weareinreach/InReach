/* eslint-disable react/no-unescaped-entities */
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useShake } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'

export const ForgotPasswordModalBody = forwardRef<HTMLButtonElement, ForgotPasswordModalBodyProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const EmailSchema = z.object({
			email: z.string().email({ message: t('form-error-enter-valid-email') as string }),
		})
		const passwordResetForm = useForm<FormProps>({
			validate: zodResolver(EmailSchema),
			validateInputOnBlur: true,
			initialValues: {
				email: '',
				cognitoSubject: t('password-reset.email-subject') as string,
				cognitoMessage: t('password-reset.email-body') as string,
			},
		})
		const variants = useCustomVariant()
		const theme = useMantineTheme()
		const pwResetHandler = api.user.forgotPassword.useMutation()
		const { animateCSS, fireEvent } = useShake({ variant: 1 })
		const [opened, handler] = useDisclosure(false)

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		const successMessage = (
			<Group>
				<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={14} />
				<Text variant={variants.Text.utility3}>{t('email-sent')}</Text>
			</Group>
		)

		const submitHandler = () => {
			if (passwordResetForm.isValid()) {
				pwResetHandler.mutate(passwordResetForm.values)
			} else {
				fireEvent()
			}
		}

		return (
			<>
				<Modal
					className={animateCSS}
					title={modalTitle}
					opened={opened}
					onClose={() => handler.close()}
					styles={(theme) => ({ content: { zIndex: 400 } })}
				>
					<Stack align='center' spacing={24}>
						<Title order={2}>{t('reset-password')}</Title>
						<Text variant={variants.Text.utility4darkGray}>{t('reset-password-message')}</Text>
						<TextInput
							label={t('words.email')}
							placeholder={t('enter-email-placeholder') as string}
							required
							{...passwordResetForm.getInputProps('email')}
							description={pwResetHandler.isSuccess ? successMessage : undefined}
						/>
						<Button
							onClick={() => submitHandler()}
							variant='primary-icon'
							fullWidth
							loaderPosition='center'
							loading={pwResetHandler.isLoading}
							// disabled={!passwordResetForm.isValid()}
						>
							{t('send-email')}
						</Button>
					</Stack>
				</Modal>
				<Box component='button' ref={ref} {...props} />
			</>
		)
	}
)

ForgotPasswordModalBody.displayName = 'ForgotPasswordModal'

export const ForgotPasswordModal = createPolymorphicComponent<'button', ForgotPasswordModalBodyProps>(
	ForgotPasswordModalBody
)

export type ForgotPasswordModalBodyProps = ButtonProps

type FormProps = {
	email: string
	cognitoSubject: string
	cognitoMessage: string
}
