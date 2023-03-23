/* eslint-disable react/no-unescaped-entities */
import {
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
	Group,
	type ButtonProps,
	Modal,
	Box,
	createPolymorphicComponent,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'

export const ForgotPasswordModalBody = forwardRef<HTMLButtonElement, ForgotPasswordModalProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const EmailSchema = z.object({
			email: z.string().email({ message: t('error-enter-valid-email') as string }),
		})
		const form = useForm<FormProps>({
			validate: zodResolver(EmailSchema),
			validateInputOnBlur: true,
		})
		const variants = useCustomVariant()
		const theme = useMantineTheme()
		const pwResetHandler = api.user.resetPassword.useMutation()

		const [opened, handler] = useDisclosure(false)

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		const successMessage = (
			<Group>
				<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={14} />
				<Text variant={variants.Text.utility3}>{t('email-sent')}</Text>
			</Group>
		)
		console.log('valid?', form.isValid())
		// TODO: Add 'shake' animation on invalid submit attempt
		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack align='center' spacing={24}>
						<Title order={2}>{t('reset-password')}</Title>
						<Text variant={variants.Text.utility4darkGray}>{t('reset-password-message')}</Text>
						<TextInput
							label={t('email')}
							placeholder={t('enter-email-placeholder') as string}
							required
							{...form.getInputProps('email')}
							description={pwResetHandler.isSuccess ? successMessage : undefined}
						/>
						<Button
							onClick={() => pwResetHandler.mutate(form.values)}
							variant='primary-icon'
							fullWidth
							loaderPosition='center'
							loading={pwResetHandler.isLoading}
							disabled={!form.isValid()}
						>
							{t('send-email')}
						</Button>
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
			</>
		)
	}
)

ForgotPasswordModalBody.displayName = 'ForgotPasswordModal'

export const ForgotPasswordModal = createPolymorphicComponent<'button', ForgotPasswordModalProps>(
	ForgotPasswordModalBody
)

export interface ForgotPasswordModalProps extends ButtonProps {}

type FormProps = {
	email: string
}
