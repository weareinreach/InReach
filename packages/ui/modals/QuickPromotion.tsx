import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef, type MouseEventHandler, useCallback, useEffect, useMemo } from 'react'

import { Breadcrumb, type BreadcrumbProps } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { LoginModalLauncher, SignupModalLauncher } from './LoginSignUp'

const QuickPromotionModalBody = forwardRef<HTMLButtonElement, QuickPromotionModalProps>(
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

		const handleClose = useCallback(() => {
			if (onClose instanceof Function) {
				onClose()
			}
			if (!noClose) {
				handler.close()
			}
		}, [onClose, noClose, handler])

		const handleOpen: MouseEventHandler<HTMLButtonElement> = useCallback(
			(e) => {
				e.stopPropagation()
				handler.open()
			},
			[handler]
		)

		const titleProps = useMemo(
			() =>
				(noClose
					? {
							option: 'back',
							backTo: 'none',
							onClick: router.back,
						}
					: {
							option: 'close',
							onClick: handleClose,
						}) satisfies BreadcrumbProps,
			[router, noClose, handleClose]
		)
		const modalTitle = (
			<Group position='apart' align='center' noWrap>
				<Box maw='70%' style={{ overflow: 'hidden' }}>
					<Breadcrumb {...titleProps} />
				</Box>
			</Group>
		)

		const handleClose = useCallback(() => {
			if (noClose) {
				handler.close()
			}
		}, [noClose, handler])

		const handleOpen = useCallback(
			(e: MouseEvent<HTMLButtonElement>) => {
				e.stopPropagation()
				handler.open()
			},
			[handler]
		)

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={handleClose} fullScreen={isMobile}>
					<Stack align='center' spacing={24}>
						<Stack align='center' spacing={16}>
							<Trans
								i18nKey='quick-promo-heading'
								components={{
									emojiLg: <Text fz={40}>.</Text>,
									title2: (
										<Title ta='center' order={2}>
											.
										</Title>
									),
									textDarkGray: (
										<Text ta='center' variant={variants.Text.darkGray}>
											.
										</Text>
									),
								}}
							/>
						</Stack>
						<Stack align='center' spacing={16}>
							<Trans
								i18nKey='quick-promo-body'
								components={{
									textUtility1: (
										<Text ta='center' variant={variants.Text.utility1}>
											.
										</Text>
									),
								}}
							/>
						</Stack>
						<LoginModalLauncher component={Button} variant={variants.Button.primaryLg} fullWidth>
							{t('log-in')}
						</LoginModalLauncher>
						<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
					</Stack>
				</Modal>
				{!autoLaunch && <Box component='button' ref={ref} onClick={handleOpen} {...props} />}
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
