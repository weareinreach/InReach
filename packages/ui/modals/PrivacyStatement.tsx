import {
	Text,
	Title,
	Stack,
	List,
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

import { ModalTitle } from './ModalTitle'

export const PrivacyStatementModalBody = forwardRef<HTMLButtonElement, PrivacyModalProps>((props, ref) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
				<Stack align='center' spacing={16}>
					<Trans
						i18nKey='privacy-statement-body'
						tOptions={{
							returnObjects: true,
							joinArrays: '',
						}}
						components={{
							emojiLg: <Text fz={40}>.</Text>,
							title2: <Title order={2}>.</Title>,
							textDarkGray: <Text variant={variants.Text.darkGray}>.</Text>,
							textUtility4: <Text variant={variants.Text.utility4darkGray}>.</Text>,
							listItem: <List.Item>.</List.Item>,
							listGroup: (
								<List withPadding variant={variants.List.textDarkGray}>
									.
								</List>
							),
							linkUmami: (
								<Link external href='https://umami.is' variant={variants.Link.inheritStyle}>
									.
								</Link>
							),
							linkUmamiGDPR: (
								<Link external href='https://umami.is/docs/faq' variant={variants.Link.inheritStyle}>
									.
								</Link>
							),
							linkVercel: (
								<Link
									external
									href='https://vercel.com/docs/concepts/analytics/privacy'
									variant={variants.Link.inheritStyle}
								>
									.
								</Link>
							),
							linkPolicy: (
								<Link external href='https://inreach.org/privacy/'>
									.
								</Link>
							),
						}}
					/>
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
		</>
	)
})
PrivacyStatementModalBody.displayName = 'PrivacyStatementModal'

export const PrivacyStatementModal = createPolymorphicComponent<'button', PrivacyModalProps>(
	PrivacyStatementModalBody
)

export interface PrivacyModalProps extends ButtonProps {}
