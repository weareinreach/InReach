import { createStyles, CloseButton, Group, Text, TextInput, rem } from '@mantine/core'
import { closeModal, openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	container: {
		flexDirection: 'column',
		marginTop: rem(40),
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

export const DeleteModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const { classes } = useStyles()
	const deleteAccount = async (email: string, password: string) => {
		//TODO: [IN-784] add delete action here
		console.log('called delete account')
	}

	return (
		<Group className={classes.container}>
			<Text className={classes.heading}>{t('delete-account', { ns: 'common' })}</Text>
			<Text className={classes.subHeading}>{t('delete-account-password', { ns: 'common' })}</Text>
			<TextInput
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
					closeModal(id)
				}}
			>
				{t('cancel', { ns: 'common' })}
			</Button>
		</Group>
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openDeleteAccountModal = () =>
	openContextModal({
		modal: 'delete',
		title: modalTitle,
		innerProps: {},
	})

type DeleteModalProps = {
	title: ModalTitleProps
}
