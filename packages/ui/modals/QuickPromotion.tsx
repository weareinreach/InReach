import { createStyles, Group, List, Text } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { signIn } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	container: {
		width: '600px',
		flexDirection: 'column',
	},
	heading1: {},
	heading2: {},
	body: {},
	list: {},
}))

export const QuickPromotionModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common', 'services'])
	const { classes, cx } = useStyles()

	return (
		<Group position='center' className={classes.container}>
			🌈
			<Text>You need to log in to save resources.</Text>
			<Text>With a free InReach account you can unlock additional features:</Text>
			<List>
				<ul>💚 Save and share personalized resource lists</ul>
				<ul>💬 Leave public rating/reviews on organizations</ul>
				<ul>🏠 Suggest organizations in your area</ul>
				<ul>🔗 Claim your organization’s profile page</ul>
			</List>
			<Button>Log in</Button>
			<a>Don’t have an account?</a>
		</Group>
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

// export const LoginModal = () =>
// 	({
// 		title: modalTitle,
// 		children: <LoginModalBody />,
// 	} satisfies ModalSettings)

export const openQuickPromotionModal = () =>
	openContextModal({
		modal: 'quickPromotion',
		title: modalTitle,
		innerProps: {},
	})

type QuickPromotionModalProps = {
	title: ModalTitleProps
}
