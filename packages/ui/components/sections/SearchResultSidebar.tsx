import { Text, Switch, Stack, Divider, Skeleton, Overlay, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { AntiHateMessage, Button, SearchBox } from '~ui/components/core'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { MoreFilter } from '~ui/modals'

export const SearchResultSidebar = ({ resultCount }: SearchResultSidebarProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const theme = useMantineTheme()

	return (
		<Stack spacing={32}>
			<Skeleton visible={!resultCount}>
				<Text>{t('count.result', { count: resultCount })}</Text>
			</Skeleton>

			<Switch.Group label={t('sort.by-lgbtq-focus')} pos='relative'>
				<Switch value='bipoc' label={t('sort.bipoc')} />
				<Switch value='hiv' label={t('sort.hiv')} />
				<Switch value='immigrants' label={t('sort.immigrants')} />
				<Switch value='spanish-speakers' label={t('sort.spanish-speakers')} />
				<Switch value='transgender' label={t('sort.transgender')} />
				<Switch value='youth' label={t('sort.youth')} />
				<Overlay blur={1.5} color={theme.other.colors.secondary.white}>
					<Stack spacing={0} align='center' justify='center' h='100%'>
						<Title order={2}>🚧</Title>
						<Title order={2}>{t('words.coming-soon')}</Title>
					</Stack>
				</Overlay>
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
