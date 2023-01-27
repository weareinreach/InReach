import { createStyles, NavLink, Tabs } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	tab: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '12px 0px 8px',
		gap: '12px',
		// position: 'absolute',
		width: '75px',
		height: '70px',
		color: theme.other.colors.secondary.darkGray,
		borderTop: 0,
		'&:hover': {
			backgroundColor: theme.other.colors.secondary.white,
		},
		'&[data-active]': {
			color: theme.other.colors.secondary.black,
			borderTop: 0,
			'&[data-active]:hover': {
				backgroundColor: theme.other.colors.secondary.white,
			},
		},
	},
	tabsList: {
		borderTop: 0,
		flexWrap: 'nowrap',
	},
	root: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
}))

export const navItems = {
	search: { icon: 'carbon:search', labelKey: 'search', href: '#' },
	saved: { icon: 'carbon:favorite', labelKey: 'saved', href: '#' },
	account: { icon: 'carbon:user', labelKey: 'account', href: '#' },
	support: { icon: 'carbon:help', labelKey: 'support', href: '#' },
} as const

export const MobileNav = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const router = useRouter()

	const tabs = Object.entries(navItems).map(([key, item]) => (
		<Tabs.Tab key={key} value={key} icon={<Icon icon={item.icon} height={16} />}>
			{t(item.labelKey)}
		</Tabs.Tab>
	))

	const switchTab = (tab: string extends NavItems ? NavItems : string | null) => {
		if (tab === null) return
		if (Object.keys(navItems).includes(tab)) router.push(navItems[tab as NavItems].href)
	}

	return (
		<Tabs
			inverted
			classNames={{ tab: classes.tab, tabsList: classes.tabsList, root: classes.root }}
			defaultValue='search'
			onTabChange={switchTab}
		>
			<Tabs.List position='apart'>{tabs}</Tabs.List>
		</Tabs>
	)
}

type NavItems = keyof typeof navItems
