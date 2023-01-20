import { Icon } from '@iconify/react'
import { createStyles, NavLink } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const useStyles = createStyles((theme) => ({
	navStyle: {
		display: 'block',
		color: theme.other.colors.secondary.darkGray,
		'&:hover': {
			backgroundColor: theme.other.colors.secondary.white,
		},
		'&[data-active]': {
			color: theme.other.colors.secondary.black,
			'&[data-active]:hover': {
				backgroundColor: theme.other.colors.secondary.white,
			},
		},
	},
}))

export const navIcons = {
	Search: 'carbon:search',
	Saved: 'carbon:favorite',
	Account: 'carbon:user',
	Support: 'carbon:help',
} as const

export const NavLinkItem = ({ navItem, activeState }: Props) => {
	const { classes } = useStyles()
	const iconRender = navIcons[navItem]
	const { t } = useTranslation('attribute')
	const navlabel = t(navItem)

	return (
		<NavLink
			label={navlabel}
			icon={<Icon icon={iconRender} />}
			variant='subtle'
			active={activeState}
			className={classes.navStyle}
			styles={{ icon: { marginRight: 'unset' } }}
		/>
	)
}

type Props = {
	activeState: boolean
	// labelKey: string
	navItem: keyof typeof navIcons
}
