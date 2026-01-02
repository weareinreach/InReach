import { Box, createStyles, Flex, Modal, rem, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { type LocaleCodes, translatedLangs } from '@weareinreach/db/generated/languages'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { ModalTitle } from '~ui/modals/ModalTitle'

interface MobileLangPickerProps {
	children: React.ReactNode
}

const useStyles = createStyles((theme) => ({
	langBtn: {
		width: '100%',
		padding: `${rem(16)} ${rem(16)}`,
		borderBottom: `1px solid ${theme.other.colors.tertiary.coolGray}`,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
}))

export const MobileLangPicker = ({ children }: MobileLangPickerProps) => {
	const [opened, { open, close }] = useDisclosure(false)
	const { classes } = useStyles()
	const router = useRouter()
	const { t } = useTranslation(['common', 'country', 'user'])
	const { i18n } = useTranslation()
	const variants = useCustomVariant()
	const [selectedLang, setSelectedLang] = useState<LocaleCodes | undefined>(
		router.locale as LocaleCodes | undefined
	)

	const trigger = React.cloneElement(children as React.ReactElement, {
		onClick: (e: React.MouseEvent) => {
			e.preventDefault()
			setSelectedLang(router.locale as LocaleCodes | undefined)
			open()
		},
	})

	const handleSave = () => {
		if (!selectedLang) return
		const { pathname, asPath, query } = router
		i18n.changeLanguage(selectedLang)
		setCookie('NEXT_LOCALE', selectedLang)
		router.replace({ pathname, query }, asPath, { locale: selectedLang })
		close()
	}

	return (
		<>
			{trigger}
			<Modal
				opened={opened}
				onClose={close}
				fullScreen
				withCloseButton={false}
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: close }} />}
				padding={0}
				styles={(theme) => ({
					content: { display: 'flex', flexDirection: 'column', backgroundColor: theme.white },
					body: { flex: 1, overflow: 'hidden' },
				})}
			>
				<Flex direction='column' h='100%'>
					<Stack align='center' spacing='md' pt='xl' px='md'>
						<Title order={2}>{t('language_choose_mobile')}</Title>
						<Text variant={variants.Text.darkGray}>{t('language_select_preferred')}</Text>
					</Stack>
					<Box mt='xl' style={{ flex: 1, overflowY: 'auto' }}>
						{translatedLangs?.map((lang) => (
							<UnstyledButton
								key={lang.localeCode}
								className={classes.langBtn}
								onClick={() => setSelectedLang(lang.localeCode)}
							>
								<Text variant={variants.Text.utility1}>{lang.nativeName}</Text>
								{selectedLang === lang.localeCode && (
									<Icon icon='carbon:checkmark-filled' height={24} width={24} />
								)}
							</UnstyledButton>
						))}
					</Box>
					<Box p='md' pb={`calc(${rem(16)} + env(safe-area-inset-bottom))`}>
						<Button fullWidth onClick={handleSave} variant={variants.Button.primaryLg}>
							{t('language_update_button')}
						</Button>
					</Box>
				</Flex>
			</Modal>
		</>
	)
}
