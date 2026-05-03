import {
	createStyles,
	Flex,
	Menu,
	rem,
	Select,
	Text,
	UnstyledButton,
	type UnstyledButtonProps,
} from '@mantine/core'
import { hasCookie, setCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo } from 'react'

import { type LocaleCodes, translatedLangs } from '@weareinreach/db/generated/languages'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

const useStyles = createStyles((theme, { variant }: { variant: 'default' | 'form' }) => ({
	menuTarget: {
		padding: `${rem(4)} ${rem(12)}`,
		borderRadius: theme.spacing.sm,
		height: rem(56),
		border: variant === 'form' ? `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}` : 'none',
		backgroundColor: variant === 'form' ? theme.white : 'transparent',
		width: variant === 'form' ? '100%' : 'auto',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
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

const MenuTarget = forwardRef<
	HTMLButtonElement,
	UnstyledButtonProps & { activeLang: string | undefined; variant: 'default' | 'form' }
>(({ activeLang, variant, ...props }, ref) => {
	const { classes } = useStyles({ variant })
	const variants = useCustomVariant()
	return (
		<UnstyledButton ref={ref} {...props} className={classes.menuTarget}>
			<Flex align='center' gap='xs' style={{ flex: variant === 'form' ? 1 : 'initial' }}>
				<Icon icon='carbon:translate' width={20} height={20} />
				<Text variant={variants.Text.utility1}>{activeLang}</Text>
			</Flex>
			{variant === 'form' && <Icon icon='carbon:chevron-down' width={16} height={16} />}
		</UnstyledButton>
	)
})
MenuTarget.displayName = 'MenuTarget'

type LangPickerProps = {
	// If provided, the component acts as a controlled component for a form
	value?: string
	label?: string
	onChange?: (newLocale: LocaleCodes) => void
	variant?: 'default' | 'form'
}

export const LangPicker = ({ value, label, onChange, variant = 'default' }: LangPickerProps) => {
	const { classes } = useStyles({ variant })
	const { i18n, t } = useTranslation()
	const router = useRouter()

	const activeLang = useMemo(
		() => translatedLangs.find((lang) => lang.localeCode === (value || router.locale))?.nativeName,
		[value, router.locale]
	)

	const langHandler = useCallback(
		(newLocale: LocaleCodes) => () => {
			if (onChange) {
				onChange(newLocale) // Report selection back to parent component
			} else {
				// Default behavior: change global language
				const { pathname, asPath, query } = router
				i18n.changeLanguage(newLocale)
				setCookie('NEXT_LOCALE', newLocale)
				router.replace({ pathname, query }, asPath, { locale: newLocale })
			}
		},
		[i18n, router, onChange]
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

	useEffect(() => {
		if (!value && !hasCookie('NEXT_LOCALE')) {
			setCookie('NEXT_LOCALE', router.locale)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (variant === 'form') {
		return (
			<Select
				label={label}
				placeholder={t('words.select-language', { defaultValue: 'Select language' })}
				data={translatedLangs.map((lang) => ({
					value: lang.localeCode,
					label: lang.nativeName,
				}))}
				value={value}
				onChange={(val) => val && onChange?.(val as LocaleCodes)}
				w='100%'
				size='xs'
				styles={(theme) => ({
					input: {
						fontSize: theme.fontSizes.xs,
					},
				})}
			/>
		)
	}

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
				<MenuTarget activeLang={activeLang} variant={variant} />
			</Menu.Target>
			<Menu.Dropdown>{menuChildren}</Menu.Dropdown>
		</Menu>
	)
}
