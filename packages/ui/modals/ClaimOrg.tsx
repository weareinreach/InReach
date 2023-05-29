import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trans, useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks'

import { LoginModalLauncher } from './Login'
import { ModalTitle } from './ModalTitle'
import { SignupModalLauncher } from './SignUp'

export const ClaimOrgModalBody = forwardRef<HTMLButtonElement, ClaimOrgModalProps>(({ ...props }, ref) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close}>
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
					<LoginModalLauncher component={Button} fullWidth variant={variants.Button.primaryLg}>
						{t('log-in')}
					</LoginModalLauncher>
					<SignupModalLauncher component={Link}>{t('dont-have-account')}</SignupModalLauncher>
				</Stack>
			</Modal>
			<Box
				component='button'
				ref={ref}
				onClick={(e) => {
					e.stopPropagation()
					handler.open()
				}}
				{...props}
			/>
		</>
	)
})
ClaimOrgModalBody.displayName = 'ClaimOrgModalBody'

export const ClaimOrgModal = createPolymorphicComponent<'button', ClaimOrgModalProps>(ClaimOrgModalBody)

export type ClaimOrgModalProps = ButtonProps
