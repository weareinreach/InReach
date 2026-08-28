import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trans, useTranslation } from 'next-i18next/pages'
import { type Dispatch, type ElementType, forwardRef, type SetStateAction, useCallback } from 'react'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { LoginModalLauncher /*, SignupModalLauncher*/ } from './LoginSignUp'
import { ModalTitle } from './ModalTitle'

const ClaimOrgModalBody = forwardRef<HTMLButtonElement, ClaimOrgModalProps>(
	({ externalOpen, externalStateHandler, component: Component, ...props }, ref) => {
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
					<Stack align='center' gap={24}>
						<Stack align='center' gap={16}>
							<Trans
								i18nKey='claim-org-modal.title'
								components={{
									emojiLg: <Text fz={40}>.</Text>,
									title2: (
										<Title order={2} ta='center'>
											.
										</Title>
									),
									textDarkGray: (
										<Text variant={variants.Text.darkGray} ta='center'>
											.
										</Text>
									),
								}}
							/>
						</Stack>
						<Stack align='center' gap={14}>
							<Trans
								i18nKey='claim-org-modal.list'
								components={{
									textUtility1: (
										<Text variant={variants.Text.utility1} ta='center'>
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
				{/* `Box` strips `variant`/`size` out of the props it forwards to a swapped `component`,
				    converting them into DOM data-attributes instead of real props - harmless for a plain
				    HTML tag, but it means a Mantine-styled component swapped in via `component` (e.g.
				    `component={Badge}`, used by `Badge/Claimed.tsx`) never actually receives its own
				    `variant`, silently falling back to Mantine's own default look. Bypass `Box` entirely
				    once `component` is anything other than a plain tag name. */}
				{Component && typeof Component !== 'string' ? (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<Component ref={ref} onClick={handler.open} {...(props as any)} />
				) : (
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<Box component={(Component ?? 'button') as any} ref={ref} onClick={handler.open} {...props} />
				)}
			</>
		)
	}
)
ClaimOrgModalBody.displayName = 'ClaimOrgModalBody'

export const ClaimOrgModal = createPolymorphicComponent<'button', ClaimOrgModalProps>(ClaimOrgModalBody)

export interface ClaimOrgModalProps extends ButtonProps {
	externalOpen?: boolean
	externalStateHandler?: Dispatch<SetStateAction<boolean>>
	component?: ElementType
}
