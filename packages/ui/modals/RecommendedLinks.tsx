import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'

const RecommendedLinksModalBody = forwardRef<HTMLButtonElement, RecommendedLinksModalProps>((props, ref) => {
	const { t } = useTranslation()
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />

	const buttons = Object.entries(t('recommended-links.buttons', { returnObjects: true }) || {})
	const handleButtonClick = (link: string) => {
		window.open(link, '_blank')
	}

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile} zIndex={999999}>
				<Stack align='center' spacing={16}>
					<Text align='center' fz={40}>
						{t('recommended-links.emoji')}
					</Text>
					<Title order={2} align='center'>
						{t('recommended-links.title')}
					</Title>
					<Text align='center' variant={variants.Text.darkGray}>
						{t('recommended-links.body')}
					</Text>
					<Stack spacing={16} style={{ maxWidth: '100%' }}>
						{buttons.map(([key, btn]) => (
							<Button
								key={key}
								variant='secondary-icon'
								sx={{
									paddingLeft: isMobile ? '1rem' : undefined,
									paddingRight: isMobile ? '1rem' : undefined,
									textDecoration: 'none',
								}}
								onClick={() => handleButtonClick(btn.link)}
							>
								<Text ta='center' variant={variants.Text.utility1} fz={isMobile ? '.75rem' : undefined}>
									{btn.text}
								</Text>
							</Button>
						))}
					</Stack>
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={handler.open} {...props} />
		</>
	)
})
RecommendedLinksModalBody.displayName = 'RecommendedLinksModal'

export const RecommendedLinksModal = createPolymorphicComponent<'button', RecommendedLinksModalProps>(
	RecommendedLinksModalBody
)

export type RecommendedLinksModalProps = ButtonProps
