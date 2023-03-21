import { Text, Title, Stack, Modal, Box, createPolymorphicComponent, type ButtonProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { AntiHateMessage, Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'

const TransContent = ({ i18nKey }: { i18nKey: string }) => {
	const variants = useCustomVariant()

	return (
		<Trans
			i18nKey={i18nKey}
			components={{
				title1: <Title order={1}>.</Title>,
				title2: <Title order={2}>.</Title>,
				title3: <Title order={3}>.</Title>,
				textReg: <Text ta='justify'>.</Text>,
				stack16: (
					<Stack align='center' spacing={16}>
						.
					</Stack>
				),
				linkAccessibility: (
					<Link external href='https://www.w3.org/TR/WCAG21/' variant={variants.Link.inlineUtil1}>
						.
					</Link>
				),
			}}
		/>
	)
}

const presetContent = {
	custom: undefined,
	disclaimer: <TransContent i18nKey='modal-content.disclaimer' />,
	antiHate: <AntiHateMessage noCard stacked />,
	accessibilityStatement: <TransContent i18nKey='modal-content.accessibility' />,
} as const

export const GenericContentModalBody = forwardRef<HTMLButtonElement, GenericContentModalProps>(
	({ customBody, content, accept, ...props }: GenericContentModalProps, ref) => {
		const { t } = useTranslation(['common'])
		const variants = useCustomVariant()
		const [opened, handlers] = useDisclosure(false)

		const modalChildren = content === 'custom' ? customBody : presetContent[content]
		const modalTitle = accept ? undefined : (
			<ModalTitle breadcrumb={{ option: 'close', onClick: () => handlers.close() }} />
		)

		return (
			<>
				<Modal opened={opened} onClose={() => handlers.close()} title={modalTitle}>
					<Stack align='center' spacing={24}>
						{modalChildren}
						{accept ? (
							<Button variant={variants.Button.primaryLg} onClick={() => handlers.close()} fullWidth>
								{t('words.accept')}
							</Button>
						) : null}
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={() => handlers.open()} {...props} />
			</>
		)
	}
)
GenericContentModalBody.displayName = 'GenericContentModal'

export const GenericContentModal = createPolymorphicComponent<'button', GenericContentModalProps>(
	GenericContentModalBody
)
export interface GenericContentModalProps extends ButtonProps {
	customBody?: ReactNode
	content: keyof typeof presetContent
	accept?: boolean
}
