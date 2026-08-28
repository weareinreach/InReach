import { Box, type ButtonProps, createPolymorphicComponent, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef } from 'react'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { cx } from '~ui/lib/cx'

import { ModalTitle } from './ModalTitle'
import classes from './RecommendedLinks.module.css'

const RecommendedLinksModalBody = forwardRef<HTMLButtonElement, RecommendedLinksModalProps>((props, ref) => {
	const { t } = useTranslation()
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />

	const buttons = Object.entries(t('recommended-links.buttons', { returnObjects: true }) || {})
	const getButtonClickHandler = (link: string) => {
		return () => window.open(link, '_blank')
	}

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile} zIndex={999999}>
				<Stack align='center' gap={16}>
					<Text ta='center' fz={40}>
						{t('recommended-links.emoji')}
					</Text>
					<Title order={2} ta='center'>
						{t('recommended-links.title')}
					</Title>
					<Text ta='center' variant={variants.Text.darkGray}>
						{t('recommended-links.body')}
					</Text>
					<Stack gap={16} style={{ maxWidth: '100%' }}>
						{buttons.map(([key, btn]) => (
							<Button
								key={key}
								variant='secondary-icon'
								className={cx(isMobile ? classes.buttonMobile : classes.button)}
								onClick={getButtonClickHandler(btn.link)}
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
