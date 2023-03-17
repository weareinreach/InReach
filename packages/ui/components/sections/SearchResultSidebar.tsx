import { Text, Switch, Stack, Divider, Skeleton } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { AntiHateMessage, Button, SearchBox } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { MoreFilter } from '~ui/modals'

export const SearchResultSidebar = ({ resultCount }: SearchResultSidebarProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()

	return (
		<Stack spacing={32}>
			<Skeleton visible={!resultCount}>
				<Text>{t('count.result', { count: resultCount })}</Text>
			</Skeleton>
			<Switch.Group label={t('sort.by-lgbtq-focus')}>
				<Switch value='bipoc' label={t('sort.bipoc')} />
				<Switch value='hiv' label={t('sort.hiv')} />
				<Switch value='immigrants' label={t('sort.immigrants')} />
				<Switch value='spanish-speakers' label={t('sort.spanish-speakers')} />
				<Switch value='transgender' label={t('sort.transgender')} />
				<Switch value='youth' label={t('sort.youth')} />
			</Switch.Group>
			<Divider />
			<SearchBox type='organization' label={t('search.look-up-org')} />
			<Divider />
			<MoreFilter
				component={Button}
				variant={variants.Button.primaryLg}
				leftIcon={<Icon icon='carbon:settings-adjust' rotate={2} />}
				resultCount={resultCount}
			>
				{t('more.filters')}
			</MoreFilter>
			<AntiHateMessage />
		</Stack>
	)
}

interface SearchResultSidebarProps {
	resultCount?: number
}
