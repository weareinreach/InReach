import { createStyles, Group, Text, rem } from '@mantine/core'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core'

import { openLoginModal } from './Login'
import { ModalTitle, ModalTitleProps } from './ModalTitle'
import { openSignUpModal } from './SignUp'
import { Link } from '../components/core/Link'

const useStyles = createStyles((theme) => ({
	container: {
		flexDirection: 'column',
		marginTop: rem(40),
		textAlign: 'center',
	},
	heading1: {
		...theme.other.utilityFonts.utility1,
		fontSize: rem(40),
	},
	heading2: {
		...theme.other.utilityFonts.utility1,
		fontSize: rem(24),
	},
	heading3: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
		marginBottom: rem(24),
	},
	body: {
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.darkGray,
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
			<Text className={classes.heading1}>🌈</Text>
			<Text className={classes.heading2}>{t('quick-promo-heading2', { ns: 'common' })}</Text>
			<Text className={classes.heading3}>{t('quick-promo-heading3', { ns: 'common' })}</Text>
			<Text className={classes.body}>{t('quick-promo-body1', { ns: 'common' })}</Text>
			<Text className={classes.body}>{t('quick-promo-body2', { ns: 'common' })}</Text>
			<Text className={classes.body}>{t('quick-promo-body3', { ns: 'common' })}</Text>
			<Text className={classes.body}>{t('quick-promo-body4', { ns: 'common' })}</Text>
			<Button
				className={classes.button}
				onClick={() => {
					openLoginModal()
				}}
			>
				{t('log-in', { ns: 'common' })}
			</Button>
			<Link
				href='/'
				onClick={() => {
					openSignUpModal()
				}}
				onMouseEnter={() => {}}
				onTouchStart={() => {}}
			>
				{t('dont-have-account', { ns: 'common' })}
			</Link>
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

type QuickPromotionModalProps = {
	title: ModalTitleProps
}
