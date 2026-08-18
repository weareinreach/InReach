import {
	Box,
	Button,
	type ButtonProps,
	createPolymorphicComponent,
	Divider,
	Group,
	List,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Trans, useTranslation } from 'next-i18next/pages'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant, useScreenSize } from '~ui/hooks'

import { ModalTitle } from './ModalTitle'

const PrivacyStatementModalBody = forwardRef<HTMLButtonElement, PrivacyModalProps>((props, ref) => {
	const variants = useCustomVariant()
	const [opened, { open: openModal, close: closeModal }] = useDisclosure(false)
	const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false)
	const { isMobile } = useScreenSize()
	const { t } = useTranslation('common')
	const [ga4Enabled, setGa4Enabled] = useState(false)

	useEffect(() => {
		if (settingsOpened) {
			const raw = localStorage.getItem('react-hook-consent')
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const p = raw ? (JSON.parse(raw) as any) : {}
				setGa4Enabled(p.services?.ga4 === true)
			} catch {
				// Ignore JSON parsing errors for stale or malformed localStorage data
			}
		}
	}, [settingsOpened])

	const toggleGa4 = (val: boolean) => {
		setGa4Enabled(val)
		const raw = localStorage.getItem('react-hook-consent') || '{}'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const p = JSON.parse(raw) as any
		localStorage.setItem(
			'react-hook-consent',
			JSON.stringify({
				...p,
				services: { ...(p.services || {}), ga4: val },
			})
		)
		window.dispatchEvent(new Event('consent-updated'))
	}

	const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: closeModal }} />

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
			linkCookieSettings: (
				<button
					type='button'
					onClick={openSettings}
					style={{
						background: 'none',
						border: 'none',
						textDecoration: 'underline',
						cursor: 'pointer',
						color: 'inherit',
						font: 'inherit',
						padding: 0,
					}}
				>
					{t('words.customize')}
				</button>
			),
		}),
		[variants, openSettings, t]
	)

	const tOptions = useMemo(() => ({ returnObjects: true, joinArrays: '' }), [])

	return (
		<>
			<Modal title={modalTitle} opened={opened} onClose={closeModal} fullScreen={isMobile} zIndex={999999}>
				<Stack align='center' spacing={16}>
					<Trans i18nKey='privacy-statement-head' tOptions={tOptions} components={components} />
					<Stack spacing={16}>
						<Trans i18nKey='privacy-statement-body' tOptions={tOptions} components={components} />
					</Stack>
					<Trans i18nKey='privacy-statement-foot' tOptions={tOptions} components={components} />
				</Stack>
			</Modal>

			<Modal
				opened={settingsOpened}
				onClose={closeSettings}
				title={t('cookie-consent.modal-title')}
				centered
				zIndex={9999999}
			>
				<Stack spacing='md'>
					<Divider />
					<Group position='apart'>
						<Text weight={500}>{t('cookie-consent.item-basic')}</Text>
						{/* Native react-toggle without custom icons picks up existing CSS */}
						<Toggle checked={true} disabled={true} />
					</Group>
					<Group position='apart'>
						<Text weight={500}>{t('cookie-consent.item-ga4')}</Text>
						<Toggle
							checked={ga4Enabled}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleGa4(e.target.checked)}
						/>
					</Group>
					<Divider />
					<Button onClick={closeSettings} fullWidth>
						{t('words.accept')}
					</Button>
				</Stack>
			</Modal>

			<Box component='button' ref={ref} onClick={openModal} {...props} />
		</>
	)
})

PrivacyStatementModalBody.displayName = 'PrivacyStatementModal'
export const PrivacyStatementModal = createPolymorphicComponent<'button', PrivacyModalProps>(
	PrivacyStatementModalBody
)
export type PrivacyModalProps = Omit<ButtonProps, 'variant'> & {
	variant?: ButtonProps['variant'] | (string & NonNullable<unknown>)
}

// Turbopack has a confirmed history of hydration mismatches specifically for `next/dynamic(() =>
// import(...).then((mod) => mod.NamedExport))` (vercel/next.js#70795) - a default export sidesteps
// the named-export resolution path entirely, letting `dynamic(() => import('./PrivacyStatement'))`
// be used directly with no `.then()`.
export default PrivacyStatementModal
