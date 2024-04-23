import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	List,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trans } from 'next-i18next'
import { forwardRef, useMemo } from 'react'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'

const PrivacyStatementModalBody = forwardRef<HTMLButtonElement, PrivacyModalProps>((props, ref) => {
	const variants = useCustomVariant()
	const [opened, handler] = useDisclosure(false)
	const { isMobile } = useScreenSize()

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />

	const components = useMemo(
		() => ({
			emojiLg: <Text fz={40}>.</Text>,
			title2: <Title order={2}>.</Title>,
			textDarkGray: <Text variant={variants.Text.darkGray}>.</Text>,
			textDarkGrayCentered: (
				<Text align='center' variant={variants.Text.darkGray}>
					.
				</Text>
			),
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
					href='https://vercel.com/docs/concepts/speed-insights/privacy-policy'
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
		}),
		[variants]
	)
	const tOptions = useMemo(
		() => ({
			returnObjects: true,
			joinArrays: '',
		}),
		[]
	)

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile} zIndex={999999}>
				<Stack align='center' spacing={16}>
					<Trans i18nKey='privacy-statement-head' tOptions={tOptions} components={components} />
					<Stack spacing={16}>
						<Trans i18nKey='privacy-statement-body' tOptions={tOptions} components={components} />
					</Stack>
					<Trans i18nKey='privacy-statement-foot' tOptions={tOptions} components={components} />
				</Stack>
			</Modal>
			<Box component='button' ref={ref} onClick={handler.open} {...props} />
		</>
	)
})
PrivacyStatementModalBody.displayName = 'PrivacyStatementModal'

export const PrivacyStatementModal = createPolymorphicComponent<'button', PrivacyModalProps>(
	PrivacyStatementModalBody
)

export type PrivacyModalProps = ButtonProps
