import { createStyles, Flex, Menu, rem, Text, UnstyledButton, type UnstyledButtonProps } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useMemo } from 'react'

import { type LocaleCodes, translatedLangs } from '@weareinreach/db/generated/languages'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	menuTarget: {
		padding: `${rem(4)} ${rem(12)}`,
		borderRadius: theme.spacing.sm,
		height: rem(56),
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
		'&[data-expanded]': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	menuItem: {
		...theme.other.utilityFonts.utility1,
		color: `${theme.other.colors.secondary.black} !important`,
		padding: `${rem(16)} ${rem(32)}`,
		...theme.fn.hover({ backgroundColor: theme.other.colors.primary.lightGray, cursor: 'pointer' }),
	},
}))

const MenuTarget = forwardRef<HTMLButtonElement, UnstyledButtonProps & { activeLang: string | undefined }>(
	({ activeLang, ...props }, ref) => {
		const { classes } = useStyles()
		const variants = useCustomVariant()
		return (
			<UnstyledButton ref={ref} {...props} className={classes.menuTarget}>
				<Flex align='center' gap='xs'>
					<Icon icon='carbon:translate' width={20} height={20} />
					<Text variant={variants.Text.utility1}>{activeLang}</Text>
				</Flex>
			</UnstyledButton>
		)
	}
)
MenuTarget.displayName = 'MenuTarget'

export const LangPicker = () => {
	const { classes } = useStyles()
	const { i18n } = useTranslation()
	const router = useRouter()
	const currentLanguage = router.locale

	const activeLang = useMemo(
		() => translatedLangs.find((lang) => lang.localeCode === currentLanguage)?.nativeName,
		[currentLanguage]
	)

	const langHandler = useCallback(
		(newLocale: LocaleCodes) => () => {
			const { pathname, asPath, query } = router
			i18n.changeLanguage(newLocale)
			router.replace({ pathname, query }, asPath, { locale: newLocale })
		},
		[i18n, router]
	)
	const menuChildren = useMemo(
		() =>
			translatedLangs.map((lang) => (
				<Menu.Item key={lang.localeCode} onClick={langHandler(lang.localeCode)}>
					{lang.nativeName}
				</Menu.Item>
			)),
		[langHandler]
	)

	return (
		<Menu
			trigger='hover'
			classNames={{
				item: classes.menuItem,
			}}
			position='bottom-start'
			transitionProps={{
				transition: 'scale-y',
			}}
			radius='sm'
			shadow='xs'
		>
			<Menu.Target>
				<MenuTarget activeLang={activeLang} />
			</Menu.Target>
			<Menu.Dropdown>{menuChildren}</Menu.Dropdown>
		</Menu>
	)
}
