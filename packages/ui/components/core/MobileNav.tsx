import { createStyles, rem, Tabs } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'
import { useSearchState } from '~ui/providers/SearchState'

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

export const MobileNav = ({ className }: { className?: string }) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const router = useRouter()
	const { searchParams } = useSearchState()
	//  const navItems = {
	// 	search: { icon: 'carbon:search', labelKey: 'words.search', href: '/search' },
	// 	saved: { icon: 'carbon:favorite', labelKey: 'words.saved', href: '/' },
	// 	account: { icon: 'carbon:user', labelKey: 'words.account', href: '/' },
	// 	support: { icon: 'carbon:help', labelKey: 'words.support', href: '/' },
	// } as const
	// const tabs = Object.entries(navItems).map(([key, item]) => (
	// 	<Tabs.Tab key={key} value={key} icon={<Icon icon={item.icon} height={20} />}>
	// 		{t(item.labelKey)}
	// 	</Tabs.Tab>
	// ))

	// const switchTab = (tab: string extends NavItems ? NavItems : string | null) => {
	// 	if (tab === null) return
	// 	if (Object.keys(navItems).includes(tab)) router.push(navItems[tab as NavItems].href)
	// }

	return (
		<Tabs
			inverted
			className={className}
			classNames={{ ...classes }}
			defaultValue='search'
			onTabChange={(tab) => {
				switch (tab) {
					case 'search':
						if (searchParams.searchState.params.length) {
							router.push({
								pathname: '/search/[...params]',
								query: searchParams.searchState,
							})
						} else {
							router.push('/')
						}
						break
					case 'saved':
						router.push('/saved')
						break
					case 'account':
						router.push('/account')
						break
					case 'support':
						router.push('/support')
						break
					default:
						console.log(tab)
				}
			}}
		>
			<Tabs.List position='apart'>
				<Tabs.Tab
					value='search'
					icon={
						<Icon
							icon={searchParams.searchState.params.length ? 'carbon:search' : 'carbon:home'}
							height={20}
						/>
					}
				>
					{t(searchParams.searchState.params.length ? 'words.search' : 'words:home')}
				</Tabs.Tab>{' '}
				<Tabs.Tab value='saved' icon={<Icon icon='carbon:favorite' height={20} />}>
					{t('words.saved')}
				</Tabs.Tab>
				<Tabs.Tab value='account' icon={<Icon icon='carbon:user' height={20} />}>
					{t('words.account')}
				</Tabs.Tab>
				<Tabs.Tab value='support' icon={<Icon icon='carbon:help' height={20} />}>
					{t('words.support')}
				</Tabs.Tab>
			</Tabs.List>
		</Tabs>
	)
}

// type NavItems = keyof typeof navItems
