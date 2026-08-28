import { Tabs } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useState } from 'react'

import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'

import { MobileLangPicker } from './MobileLangPicker'
import classes from './MobileNav.module.css'

export const MobileNav = ({ className }: { className?: string }) => {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { searchState } = useSearchState()
	// `Tabs` is controlled (rather than `defaultValue`) specifically so "language" can be excluded
	// below - it opens a modal via `MobileLangPicker`'s own `onClick` rather than navigating
	// anywhere, so it shouldn't ever become the visually "active" tab the way a real nav
	// destination does.
	const [activeTab, setActiveTab] = useState<TabName>('search')

	const showSearch = Boolean(searchState.params?.length) && router.pathname !== '/search/[...params]'

	const handleTabChange = useCallback(
		(tab: string | null) => {
			switch (tab) {
				case 'search': {
					setActiveTab('search')
					const query = searchState.getRoute()
					if (query && showSearch) {
						router.push({
							pathname: '/search/[...params]',
							query,
						})
					} else {
						router.push('/')
					}
					break
				}
				case 'saved':
					setActiveTab('saved')
					router.push('/account/saved')
					break
				case 'account':
					setActiveTab('account')
					router.push('/account')
					break
				case 'support':
					setActiveTab('support')
					router.push('/support')
					break
				default:
			}
		},
		[router, searchState, showSearch]
	)

	return (
		<Tabs
			inverted
			className={className}
			classNames={{
				root: classes.root,
				tab: classes.tab,
				tabLabel: classes.tabLabel,
				list: classes.list,
				tabSection: classes.tabSection,
			}}
			value={activeTab}
			onChange={handleTabChange}
		>
			<Tabs.List justify='space-between'>
				{showSearch ? (
					<Tabs.Tab value='search' leftSection={<Icon icon={'carbon:search'} height={20} />}>
						{t('words.search')}
					</Tabs.Tab>
				) : (
					<Tabs.Tab value='search' leftSection={<Icon icon={'carbon:home'} height={20} />}>
						{t('words.home', { defaultValue: 'Home' })}
					</Tabs.Tab>
				)}
				<Tabs.Tab value='saved' leftSection={<Icon icon='carbon:favorite' height={20} />}>
					{t('words.saved', { defaultValue: 'Saved' })}
				</Tabs.Tab>
				<Tabs.Tab value='account' leftSection={<Icon icon='carbon:user' height={20} />}>
					{t('words.account', { defaultValue: 'Account' })}
				</Tabs.Tab>
				<Tabs.Tab value='support' leftSection={<Icon icon='carbon:help' height={20} />}>
					{t('words.support', { defaultValue: 'Support' })}
				</Tabs.Tab>
				<MobileLangPicker>
					<Tabs.Tab value='language' leftSection={<Icon icon='carbon:translate' height={20} />}>
						{t('words.language', { defaultValue: 'Language' })}
					</Tabs.Tab>
				</MobileLangPicker>
			</Tabs.List>
		</Tabs>
	)
}

type TabName = 'search' | 'saved' | 'account' | 'support'
