import { Icon } from '@iconify/react'
import { useState } from 'react'
import { Text, createStyles, NavLink } from '@mantine/core'
import NextLink from 'next/link'

const useStyles = createStyles((theme) => ({
	icon: {
		width: '75%',
		height: '75%',
	},
}))

export const navIcons = {
	search: 'carbon:search',
	saved: 'carbon:favorite',
	account: 'carbon:user',
	support: 'carbon:help'
} as const

export const NavLinkItem = ({ children, icon }: Props) => {
	const { classes } = useStyles()
	const iconRender = navIcons[icon]
	const [active, setActive] = useState(0);
	return (
		<NavLink label={children} icon={<Icon icon={iconRender} className={classes.icon} />} />
	)
}

type Props = {
	children: string
	icon: keyof typeof navIcons
}
