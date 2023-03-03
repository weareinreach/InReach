import { createStyles, Tabs, Flex, Box } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	tab: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		padding: [12, 0, 8, 0],
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
			fontWeight: theme.other.fontWeight.semibold,
			'& .mantine-Tabs-tabLabel': {
				fontWeight: theme.other.fontWeight.semibold,
			},

			'&[data-active]:hover': {
				backgroundColor: theme.other.colors.secondary.white,
			},
		},
	},
	tabLabel: {
		fontSize: theme.fontSizes.sm,
		fontWeight: theme.other.fontWeight.regular,
	},
	tabsList: {
		borderTop: 0,
		flexWrap: 'nowrap',
		height: 70,
		justifyContent: 'space-around',
	},
	root: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
	},
}))

const decorativeBox = {
	width: 134,
	height: 5,
	borderRadius: 3,
}

export const navItems = {
	search: { icon: 'carbon:search', labelKey: 'search', href: '/search' },
	saved: { icon: 'carbon:favorite', labelKey: 'saved', href: '/' },
	account: { icon: 'carbon:user', labelKey: 'account', href: '/' },
	support: { icon: 'carbon:help', labelKey: 'support', href: '/' },
} as const

export const MobileNav = () => {
	const { classes } = useStyles()
	const { t } = useTranslation()
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
			<Flex justify='center' align='center' style={{ height: 20 }}>
				<Box
					sx={(theme) => ({
						...decorativeBox,
						backgroundColor: theme.other.colors.secondary.darkGray,
					})}
				/>
			</Flex>
		</Tabs>
	)
}

type NavItems = keyof typeof navItems
