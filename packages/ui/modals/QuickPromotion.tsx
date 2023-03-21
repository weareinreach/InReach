import { Text, Title, Stack } from '@mantine/core'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation, Trans } from 'next-i18next'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { openLoginModal } from './Login'
import { ModalTitle } from './ModalTitle'
import { SignupModalLauncher } from './SignUp'

export const QuickPromotionModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()

	return (
		<Stack align='center' spacing={24}>
			<Stack align='center' spacing={16}>
				<Trans
					i18nKey='quick-promo-heading'
					components={{
						emojiLg: <Text fz={40}>.</Text>,
						title2: <Title order={2}>.</Title>,
						textDarkGray: <Text variant={variants.Text.darkGray}>.</Text>,
					}}
				/>
			</Stack>
			<Stack align='center' spacing={14}>
				<Trans
					i18nKey='quick-promo-body'
					components={{
						textUtility1: <Text variant={variants.Text.utility1}>.</Text>,
					}}
				/>
			</Stack>
			<Button onClick={() => openLoginModal()} variant='primary-icon' fullWidth>
				{t('log-in')}
			</Button>
			<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
			{/* <Link external onClick={() => openSignUpModal()}>
				{t('dont-have-account')}
			</Link> */}
		</Stack>
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openQuickPromotionModal = () =>
	openContextModal({
		modal: 'quickPromotion',
		title: modalTitle,
		innerProps: {},
	})
