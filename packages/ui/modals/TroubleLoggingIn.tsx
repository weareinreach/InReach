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
import { schemaResolver, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useMemo } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize, useShake } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'

/**
 * Replaces the old `ForgotPasswordModal` on the login form. A single email-only entry point covering all
 * three real "I can't log in" causes (no account, unconfirmed account, forgotten password) without ever
 * revealing to the person which one applies - `user.troubleLoggingIn` always resolves the same way regardless
 * of what actually happened server-side, and sends whichever email is actually correct.
 */
const TroubleLoggingInModalBody = forwardRef<HTMLButtonElement, TroubleLoggingInModalBodyProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const EmailSchema = z.object({
			email: z.string().email({ message: t('form-error-enter-valid-email') }),
		})
		const form = useForm<FormProps>({
			validate: schemaResolver(EmailSchema, { sync: true }),
			validateInputOnBlur: true,
			initialValues: { email: '' },
		})
		const variants = useCustomVariant()
		const theme = useMantineTheme()
		const troubleLoggingIn = api.user.troubleLoggingIn.useMutation()
		const { animateStyle, fireEvent } = useShake({ variant: 1 })
		const [opened, handler] = useDisclosure(false)
		const { isMobile } = useScreenSize()
		const modalTitle = useMemo(
			() => <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />,
			[handler]
		)

		const successMessage = useMemo(
			() => (
				<Group>
					<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} height={14} />
					<Text variant={variants.Text.utility3}>{t('trouble-logging-in-sent')}</Text>
				</Group>
			),
			[theme, t, variants]
		)

		const submitHandler = useCallback(() => {
			if (form.isValid()) {
				troubleLoggingIn.mutate(form.values)
			} else {
				fireEvent()
			}
		}, [form, troubleLoggingIn, fireEvent])

		const closeOrMutateHandler = useCallback(() => {
			troubleLoggingIn.isSuccess ? handler.close() : submitHandler()
		}, [troubleLoggingIn.isSuccess, handler, submitHandler])

		return (
			<>
				<Modal
					style={animateStyle}
					title={modalTitle}
					opened={opened}
					onClose={handler.close}
					zIndex={550}
					fullScreen={isMobile}
				>
					<Stack align='center' gap={24}>
						<Title order={2}>{t('trouble-logging-in')}</Title>
						<Text variant={variants.Text.utility4darkGray}>{t('trouble-logging-in-message')}</Text>
						<TextInput
							label={t('words.email')}
							placeholder={t('enter-email-placeholder')}
							required
							{...form.getInputProps('email')}
							description={troubleLoggingIn.isSuccess ? successMessage : undefined}
						/>
						<Button
							onClick={closeOrMutateHandler}
							variant='primary-icon'
							fullWidth
							loading={troubleLoggingIn.isPending}
						>
							{t(troubleLoggingIn.isSuccess ? 'words.close' : 'send-email')}
						</Button>
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={handler.open} {...props} />
			</>
		)
	}
)

TroubleLoggingInModalBody.displayName = 'TroubleLoggingInModal'

export const TroubleLoggingInModal = createPolymorphicComponent<'button', TroubleLoggingInModalBodyProps>(
	TroubleLoggingInModalBody
)

export type TroubleLoggingInModalBodyProps = ButtonProps

type FormProps = {
	email: string
}
