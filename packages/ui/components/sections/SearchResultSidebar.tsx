import { Divider, Overlay, Skeleton, Stack, Switch, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { type Dispatch, type SetStateAction } from 'react'

import { AntiHateMessage } from '~ui/components/core/AntiHateMessage'
import { SearchBox } from '~ui/components/core/SearchBox'
// import { SearchDistance } from '~ui/components/core/SearchDistance'
import { useCustomVariant } from '~ui/hooks'

export const SearchResultSidebar = ({ resultCount, loadingManager }: SearchResultSidebarProps) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const theme = useMantineTheme()

	return (
		<Stack spacing={32} maw={300}>
			<Skeleton visible={!resultCount}>
				<Text variant={variants.Text.utility1}>{t('count.result', { count: resultCount })}</Text>
			</Skeleton>

			<Switch.Group label={t('sort.by-lgbtq-focus')} pos='relative'>
				<Switch value='bipoc' label={t('sort.bipoc')} />
				<Switch value='hiv' label={t('sort.hiv')} />
				<Switch value='immigrants' label={t('sort.immigrants')} />
				<Switch value='spanish-speakers' label={t('sort.spanish-speakers')} />
				<Switch value='transgender' label={t('sort.transgender')} />
				<Switch value='youth' label={t('sort.youth')} />
				<Overlay blur={0} color={theme.other.colors.secondary.white}>
					<Stack spacing={0} align='center' justify='center' h='100%'>
						<Title order={2}>🚧</Title>
						<Title order={2}>{t('words.coming-soon')}</Title>
					</Stack>
				</Overlay>
			</Switch.Group>
			<Divider />

			{/* <SearchDistance />
			<Divider /> */}

			<SearchBox
				type='organization'
				label={<Title order={3}>{t('search.look-up-org')}</Title>}
				loadingManager={loadingManager}
			/>
			<Divider mt={-10} />

			<AntiHateMessage />
		</Stack>
	)
}

interface SearchResultSidebarProps {
	resultCount?: number
	loadingManager: {
		setLoading: Dispatch<SetStateAction<boolean>>
		isLoading: boolean
	}
}
