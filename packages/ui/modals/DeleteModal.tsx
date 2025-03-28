import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	createStyles,
	Group,
	Modal,
	PasswordInput,
	rem,
	Text,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useState } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { useScreenSize } from '~ui/hooks/useScreenSize'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	container: {
		flexDirection: 'column',
	},
	heading: {
		textAlign: 'center',
		...theme.other.utilityFonts.utility1,
		fontSize: rem(24),
	},
	subHeading: {
		textAlign: 'center',
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
	},
	input: {
		width: '100%',
		textAlign: 'left',
		...theme.other.utilityFonts.utility1,
	},
	button: {
		width: '100%',
	},
}))

const DeleteModalBody = forwardRef<HTMLButtonElement, DeleteModalProps>((props, ref) => {
	const router = useRouter()
	const { t } = useTranslation(['common'])
	const [error, setError] = useState<string | undefined>()
	const schema = z.object({
		password: z.string().min(1, { message: t('form-error-password-blank') }),
	})
	const { classes } = useStyles()
	const [opened, handler] = useDisclosure(false)
	const form = useForm({
		initialValues: { password: '' },
		validate: zodResolver(schema),
	})
	const { isMobile } = useScreenSize()

	const deleteAccount = api.user.deleteAccount.useMutation({
		onSuccess: () => {
			// Causes error in storybook
			signOut()
			handler.close()
			router.push('/')
		},
		onError: (err) => {
			setError(t(err.message))
		},
	})
	const handleSubmit = useCallback(
		(password: string) => {
			form.clearErrors()
			deleteAccount.mutate(password)
		},
		[form, deleteAccount]
	)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile}>
				<form
					noValidate
					onSubmit={form.onSubmit(({ password }) => {
						handleSubmit(password)
					})}
				>
					<Group className={classes.container}>
						<Text className={classes.heading}>{t('delete-account', { ns: 'common' })}</Text>
						<Text className={classes.subHeading}>{t('delete-account-password', { ns: 'common' })}</Text>
						<PasswordInput
							label={t('password', { ns: 'common' })}
							placeholder={t('enter-password-placeholder', { ns: 'common' }) ?? ''}
							className={classes.input}
							error={error}
							{...form.getInputProps('password')}
						/>
						<Button variant='accent' className={classes.button} type='submit'>
							{t('delete', { ns: 'common' })}
						</Button>
						<Button variant='secondary' className={classes.button} onClick={handler.close}>
							{t('cancel', { ns: 'common' })}
						</Button>
					</Group>
				</form>
			</Modal>
			<Box component='button' ref={ref} onClick={handler.open} {...props} />
		</>
	)
})

DeleteModalBody.displayName = 'DeleteModal'

export const DeleteModal = createPolymorphicComponent<'button', DeleteModalProps>(DeleteModalBody)

export type DeleteModalProps = ButtonProps
