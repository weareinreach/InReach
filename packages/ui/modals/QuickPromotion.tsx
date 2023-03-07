import { createStyles, Group, List, Text, useMantineTheme, rem, em } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	container: {
		flexDirection: 'column',
		marginTop: rem(40),
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
		width: '95%',
	},
	link: {
		marginTop: rem(34),
		marginBottom: rem(50),
	},
}))

export const QuickPromotionModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const { classes } = useStyles()
	const theme = useMantineTheme()

	return (
		<Group position='center' className={classes.container}>
			<Text className={classes.heading1}>🌈</Text>
			<Text className={classes.heading2}>You need to log in to save resources.</Text>
			<Text className={classes.heading3}>
				With a free InReach account you can unlock additional features:
			</Text>
			<Text className={classes.body}>💚 Save and share personalized resource lists</Text>
			<Text className={classes.body}>💬 Leave public rating/reviews on organizations</Text>
			<Text className={classes.body}>🏠 Suggest organizations in your area</Text>
			<Text className={classes.body}>🔗 Claim your organization’s profile page</Text>
			<Button className={classes.button}>Log in</Button>
			<Link href='/' onClick={() => {}} onMouseEnter={() => {}} onTouchStart={() => {}}>
				Don’t have an account?
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
