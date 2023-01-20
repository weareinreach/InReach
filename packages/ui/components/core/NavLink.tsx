import { Icon } from '@iconify/react'
import { createStyles, NavLink } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const useStyles = createStyles((theme) => ({
	navStyle: {
		display: 'block',
		color: theme.other.colors.secondary.darkGray,
		'&:hover': {
			backgroundColor: theme.other.colors.secondary.white
		},
		'&[data-active]': {
			color: theme.other.colors.secondary.black,
			'&[data-active]:hover': {
				backgroundColor: theme.other.colors.secondary.white
			}
		},
		icon: {
			marginRight: 0
		}
	}
}))

export const navIcons = {
	search: 'carbon:search',
	saved: 'carbon:favorite',
	account: 'carbon:user',
	support: 'carbon:help',
} as const

export const NavLinkItem = ({ labelKey, icon, activeState }: Props) => {
	const { classes } = useStyles()
	const iconRender = navIcons[icon]
	const { t } = useTranslation('attribute')
	const navlabel = t(labelKey)

	return <NavLink label={navlabel}
		icon={<Icon icon={iconRender}/>}
		variant="subtle"
		active={activeState}
		className={classes.navStyle}
	/>
}

type Props = {
	activeState: boolean
	labelKey: string
	icon: keyof typeof navIcons
}
