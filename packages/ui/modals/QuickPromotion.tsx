import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, useEffect } from 'react'

import { type BreadcrumbProps } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { LoginModalLauncher } from './Login'
import { ModalTitle } from './ModalTitle'
import { SignupModalLauncher } from './SignUp'

export const QuickPromotionModalBody = forwardRef<HTMLButtonElement, QuickPromotionModalProps>(
	({ autoLaunch, noClose, onClose, ...props }, ref) => {
		const { t } = useTranslation(['common'])
		const variants = useCustomVariant()
		const { data: session, status } = useSession()
		const [opened, handler] = useDisclosure(autoLaunch && status === 'unauthenticated')
		const router = useRouter()
		const { isMobile } = useScreenSize()
		useEffect(() => {
			if (autoLaunch && !session && status === 'unauthenticated') {
				handler.open()
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [session, status, autoLaunch])

		const titleProps = (
			noClose
				? {
						option: 'back',
						backTo: 'none',
						onClick: () => router.back(),
				  }
				: {
						option: 'close',
						onClick: () => {
							if (typeof onClose === 'function') onClose()
							handler.close()
						},
				  }
		) satisfies BreadcrumbProps
		const modalTitle = <ModalTitle breadcrumb={titleProps} />

		return (
			<>
				<Modal
					title={modalTitle}
					opened={opened}
					onClose={() => (noClose ? null : handler.close())}
					fullScreen={isMobile}
				>
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
						<Stack align='center' spacing={16}>
							<Trans
								i18nKey='quick-promo-body'
								components={{
									textUtility1: <Text variant={variants.Text.utility1}>.</Text>,
								}}
							/>
						</Stack>
						<LoginModalLauncher component={Button} variant={variants.Button.primaryLg} fullWidth>
							{t('log-in')}
						</LoginModalLauncher>
						<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
					</Stack>
				</Modal>
				{!autoLaunch && (
					<Box
						component='button'
						ref={ref}
						onClick={(e) => {
							e.stopPropagation()
							handler.open()
						}}
						{...props}
					/>
				)}
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
	onClose?: () => void
}
