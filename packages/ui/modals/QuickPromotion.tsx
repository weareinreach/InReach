import { Text, Title, Stack, type ButtonProps, Modal, Box, createPolymorphicComponent } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useEffect } from 'react'

import { Button, Link, type BreadcrumbProps } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { LoginModalLauncher } from './Login'
import { ModalTitle } from './ModalTitle'
import { SignupModalLauncher } from './SignUp'

export const QuickPromotionModalBody = forwardRef<HTMLButtonElement, QuickPromotionModalProps>(
	({ autoLaunch, noClose, ...props }, ref) => {
		const { t } = useTranslation(['common'])
		const variants = useCustomVariant()
		const { data: session, status } = useSession()
		const [opened, handler] = useDisclosure(autoLaunch && status === 'unauthenticated')
		const router = useRouter()
		useEffect(() => {
			if (!session && status === 'unauthenticated') {
				handler.open()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [session, status])

		const titleProps = (
			noClose
				? {
						option: 'back',
						backTo: 'none',
						onClick: () => router.back(),
				  }
				: { option: 'close', onClick: () => handler.close() }
		) satisfies BreadcrumbProps
		const modalTitle = <ModalTitle breadcrumb={titleProps} />

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => (noClose ? null : handler.close())}>
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
						<LoginModalLauncher component={Button} fullWidth>
							{t('log-in')}
						</LoginModalLauncher>
						<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
					</Stack>
				</Modal>
				{!autoLaunch && <Box component='button' ref={ref} onClick={() => handler.open()} {...props} />}
			</>
		)
	}
)
QuickPromotionModalBody.displayName = 'QuickPromotionModal'

export const QuickPromotionModal = createPolymorphicComponent<'button', QuickPromotionModalProps>(
	QuickPromotionModalBody
)

export interface QuickPromotionModalProps extends ButtonProps {
	/** Automatically launch if no session? */
	autoLaunch?: boolean
	noClose?: boolean
}
