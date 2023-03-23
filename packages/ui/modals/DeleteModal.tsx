import {
	type ButtonProps,
	Modal,
	Box,
	createPolymorphicComponent,
	createStyles,
	PasswordInput,
	Group,
	Text,
	TextInput,
	rem,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Button } from '~ui/components/core'

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

export const DeleteModalBody = forwardRef<HTMLButtonElement, DeleteModalProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const { classes } = useStyles()
	const [opened, handler] = useDisclosure(false)
	const deleteAccount = async (email: string, password: string) => {
		//TODO: [IN-784] add delete action here
		console.log('called delete account')
	}

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
				<Group className={classes.container}>
					<Text className={classes.heading}>{t('delete-account', { ns: 'common' })}</Text>
					<Text className={classes.subHeading}>{t('delete-account-password', { ns: 'common' })}</Text>
					<PasswordInput
						label={t('password', { ns: 'common' })}
						placeholder={t('enter-password-placeholder', { ns: 'common' }) ?? ''}
						required
						className={classes.input}
					/>
					<Button
						variant='accent'
						className={classes.button}
						onClick={async () => await deleteAccount('test@email.com', 'good')}
					>
						{t('delete', { ns: 'common' })}
					</Button>
					<Button
						variant='secondary'
						className={classes.button}
						onClick={() => {
							handler.close()
						}}
					>
						{t('cancel', { ns: 'common' })}
					</Button>
				</Group>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})

DeleteModalBody.displayName = 'DeletenModal'

export const DeleteModal = createPolymorphicComponent<'button', DeleteModalProps>(DeleteModalBody)

export interface DeleteModalProps extends ButtonProps {}
