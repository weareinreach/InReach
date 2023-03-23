import {
	Button,
	Text,
	Title,
	Stack,
	type ButtonProps,
	Modal,
	Box,
	createPolymorphicComponent,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef } from 'react'

import { Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { openLoginModal } from './Login'
import { ModalTitle } from './ModalTitle'
import { SignupModalLauncher } from './SignUp'

export const QuickPromotionModalBody = forwardRef<HTMLButtonElement, QuickPromotionModalProps>(
	(props, ref) => {
		const { t } = useTranslation(['common'])
		const variants = useCustomVariant()
		const [opened, handler] = useDisclosure(false)

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
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
				</Modal>
				<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
			</>
		)
	}
)
QuickPromotionModalBody.displayName = 'QuickPromotionModal'

export const QuickPromotionModal = createPolymorphicComponent<'button', QuickPromotionModalProps>(
	QuickPromotionModalBody
)

export interface QuickPromotionModalProps extends ButtonProps {}
