/* eslint-disable react/no-unescaped-entities */
import { Stack, Text, TextInput, Title, useMantineTheme, Group } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'
import { z } from 'zod'

import { Button } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

export const ForgotPasswordModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
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

	const successMessage = (
		<Group>
			<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={14} />
			<Text variant={variants.Text.utility3}>{t('email-sent')}</Text>
		</Group>
	)
	console.log('valid?', form.isValid())
	// TODO: Add 'shake' animation on invalid submit attempt
	return (
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
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openForgotPasswordModal = () =>
	openContextModal({
		modal: 'forgotPassword',
		title: modalTitle,
		innerProps: {},
	})

type ForgotPasswordModalProps = {
	title: ModalTitleProps
}

type FormProps = {
	email: string
}
