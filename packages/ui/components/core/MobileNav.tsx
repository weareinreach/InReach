import { createStyles, Tabs, rem } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	tab: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: `${rem(12)} ${rem(0)} ${rem(8)} ${rem(0)}`,
		gap: rem(12),
		width: rem(75),
		height: rem(70),
		color: theme.other.colors.secondary.darkGray,
		borderTop: 0,
		'&:hover': {
			backgroundColor: 'transparent',
		},
		'&[data-active] > .mantine-Tabs-tabLabel': {
			color: theme.other.colors.secondary.black,
			borderTop: 0,
			fontWeight: theme.other.fontWeight.bold,

			'&[data-active]:hover': {
				backgroundColor: 'transparent',
			},
		},
		['&[data-active] > .mantine-Tabs-tabIcon']: {
			stroke: theme.other.colors.secondary.black,
			strokeWidth: rem(1),
		},
	},
	tabLabel: {
		fontSize: theme.fontSizes.sm,
		fontWeight: theme.other.fontWeight.regular,
	},
	tabsList: {
		borderTop: 0,
		flexWrap: 'nowrap',
		height: rem(70),
		justifyContent: 'space-around',
	},
	tabIcon: {
		'&:not(:only-child)': {
			margin: 0,
		},
	},
	root: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		width: '100%',
		zIndex: 20,
		backgroundColor: theme.other.colors.secondary.white,
	},
}))

export const navItems = {
	search: { icon: 'carbon:search', labelKey: 'search', href: '/search' },
	saved: { icon: 'carbon:favorite', labelKey: 'saved', href: '/' },
	account: { icon: 'carbon:user', labelKey: 'account', href: '/' },
	support: { icon: 'carbon:help', labelKey: 'support', href: '/' },
} as const

export const MobileNav = () => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const router = useRouter()

	const tabs = Object.entries(navItems).map(([key, item]) => (
		<Tabs.Tab key={key} value={key} icon={<Icon icon={item.icon} height={20} />}>
			{t(item.labelKey)}
		</Tabs.Tab>
	))

	const switchTab = (tab: string extends NavItems ? NavItems : string | null) => {
		if (tab === null) return
		if (Object.keys(navItems).includes(tab)) router.push(navItems[tab as NavItems].href)
	}

	return (
		<Tabs inverted classNames={{ ...classes }} defaultValue='search' onTabChange={switchTab}>
			<Tabs.List position='apart'>{tabs}</Tabs.List>
		</Tabs>
	)
}

type NavItems = keyof typeof navItems
