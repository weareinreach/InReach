import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trans, useTranslation } from 'next-i18next'
import { type Dispatch, forwardRef, type SetStateAction, useCallback } from 'react'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { LoginModalLauncher /*, SignupModalLauncher*/ } from './LoginSignUp'
import { ModalTitle } from './ModalTitle'

const ClaimOrgModalBody = forwardRef<HTMLButtonElement, ClaimOrgModalProps>(
	({ externalOpen, externalStateHandler, ...props }, ref) => {
		const { t } = useTranslation(['common'])
		const variants = useCustomVariant()
		const [opened, handler] = useDisclosure(false)
		const { isMobile } = useScreenSize()
		const handleClose = useCallback(() => {
			if (typeof externalStateHandler === 'function') {
				externalStateHandler(false)
			}
			handler.close()
		}, [externalStateHandler, handler])

		const modalTitle = (
			<ModalTitle
				breadcrumb={{
					option: 'close',
					onClick: handleClose,
				}}
			/>
		)

		return (
			<>
				<Modal title={modalTitle} opened={externalOpen ?? opened} onClose={handleClose} fullScreen={isMobile}>
					<Stack align='center' spacing={24}>
						<Stack align='center' spacing={16}>
							<Trans
								i18nKey='claim-org-modal.title'
								components={{
									emojiLg: <Text fz={40}>.</Text>,
									title2: (
										<Title order={2} align='center'>
											.
										</Title>
									),
									textDarkGray: (
										<Text variant={variants.Text.darkGray} align='center'>
											.
										</Text>
									),
								}}
							/>
						</Stack>
						<Stack align='center' spacing={14}>
							<Trans
								i18nKey='claim-org-modal.list'
								components={{
									textUtility1: (
										<Text variant={variants.Text.utility1} align='center'>
											.
										</Text>
									),
								}}
							/>
						</Stack>
						<LoginModalLauncher component={Button} fullWidth variant={variants.Button.primaryLg} disabled>
							{/* {t('log-in')} */}
							{t('words.coming-soon')}
						</LoginModalLauncher>
						{/* <SignupModalLauncher component={Link}>
							{t('dont-have-account')}
						</SignupModalLauncher> */}
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={handler.open} {...props} />
			</>
		)
	}
)
ClaimOrgModalBody.displayName = 'ClaimOrgModalBody'

export const ClaimOrgModal = createPolymorphicComponent<'button', ClaimOrgModalProps>(ClaimOrgModalBody)

export interface ClaimOrgModalProps extends ButtonProps {
	externalOpen?: boolean
	externalStateHandler?: Dispatch<SetStateAction<boolean>>
}
