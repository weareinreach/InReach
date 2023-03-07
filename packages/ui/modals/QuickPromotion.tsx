import { createStyles, Group, Text, rem, Title, Anchor } from '@mantine/core'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation, Trans } from 'next-i18next'

import { Button } from '~ui/components/core'

import { openLoginModal } from './Login'
import { ModalTitle, ModalTitleProps } from './ModalTitle'
import { openSignUpModal } from './SignUp'

const useStyles = createStyles((theme) => ({
	container: {
		flexDirection: 'column',
		marginTop: rem(40),
		textAlign: 'center',
	},
	button: {
		marginTop: rem(24),
		width: '100%',
	},
	link: {
		marginTop: rem(34),
		marginBottom: rem(50),
	},
}))

export const QuickPromotionModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const { classes } = useStyles()

	return (
		<Group position='center' className={classes.container}>
			<Trans i18nKey='quick-promo-login'>
				<Title order={1}>🌈</Title>
				<Title order={2}>You need to log in to save resources.</Title>
				<Text variant='darkGray'>With a free InReach account you can unlock additional features:</Text>
				<Text variant='utility1darkGray'>💚 Save and share personalized resource lists</Text>
				<Text variant='utility1darkGray'>💬 Leave public rating/reviews on organizations</Text>
				<Text variant='utility1darkGray'>🏠 Suggest organizations in your area</Text>
				<Text variant='utility1darkGray'>🔗 Claim your organization’s profile page</Text>
			</Trans>

			<Button className={classes.button} onClick={() => openLoginModal()} variant='primary-icon'>
				{t('log-in')}
			</Button>
			<Anchor onClick={() => openSignUpModal()}>{t('dont-have-account')}</Anchor>
		</Group>
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openQuickPromotionModal = () =>
	openContextModal({
		modal: 'quickPromotion',
		title: modalTitle,
		innerProps: {},
	})
