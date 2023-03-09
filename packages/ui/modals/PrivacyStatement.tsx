import { Text, Title, Stack, List } from '@mantine/core'
import { openContextModal } from '@mantine/modals'
import { ContextModalProps } from '@mantine/modals/lib/context'
import { useTranslation, Trans } from 'next-i18next'

import { Button, Link } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'

export const PrivacyStatementModalBody = ({ context, id, innerProps }: ContextModalProps<{}>) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()

	return (
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
	)
}

const modalTitle = <ModalTitle breadcrumb={{ option: 'close' }} />

export const openPrivacyStatementModal = () =>
	openContextModal({
		modal: 'privacyStatement',
		title: modalTitle,
		innerProps: {},
	})
