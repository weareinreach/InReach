import { Menu, Text, Flex, UnstyledButton, createStyles, UnstyledButtonProps, rem } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { translatedLangs, LocaleCodes } from '~api/generated/languages'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	menuTarget: {
		paddingBottom: theme.spacing.sm,
		paddingTop: theme.spacing.sm,
		paddingLeft: theme.spacing.xs,
		paddingRight: theme.spacing.xs,
		borderRadius: theme.spacing.sm,
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
	},
	dropdown: {
		borderRadius: theme.spacing.sm,
	},
}))

const MenuTarget = forwardRef<HTMLButtonElement, UnstyledButtonProps & { activeLang: string | undefined }>(
	({ activeLang, ...props }, ref) => {
		const { classes } = useStyles()
		return (
			<UnstyledButton ref={ref} {...props} className={classes.menuTarget}>
				<Flex align='center' gap='xs'>
					<Icon icon='carbon:translate' width={20} height={20} />
					<Text sx={(theme) => ({ ...theme.other.utilityFonts.utility1 })}>{activeLang}</Text>
				</Flex>
			</UnstyledButton>
		)
	}
)
MenuTarget.displayName = 'MenuTarget'

export const LangPicker = () => {
	const { classes } = useStyles()
	const { i18n } = useTranslation()
	const currentLanguage = i18n.language
	const router = useRouter()

	const activeLang = translatedLangs.find((lang) => lang.localeCode === currentLanguage)?.nativeName

	const langHandler = (newLocale: LocaleCodes) => {
		const { pathname, asPath, query } = router
		i18n.changeLanguage(newLocale)
		router.replace({ pathname, query }, asPath, { locale: newLocale })
	}

	return (
		<Menu
			trigger='hover'
			classNames={{
				item: classes.menuItem,
				dropdown: classes.dropdown,
			}}
		>
			<Menu.Target>
				<MenuTarget activeLang={activeLang} />
			</Menu.Target>
			<Menu.Dropdown>
				{translatedLangs.map((lang) => (
					<Menu.Item key={lang.localeCode} onClick={() => langHandler(lang.localeCode)}>
						{lang.nativeName}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	)
}
