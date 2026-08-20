import { Select } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'

import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'

import classes from './SortBiasSelector.module.css'

export const SortBiasSelector = () => {
	const { t } = useTranslation('common')
	const { searchState, searchStateActions } = useSearchState()

	const value = (searchState as { sortBias?: string }).sortBias || 'DISTANCE'

	return (
		<Select
			label={t('words.sort-by')}
			classNames={{ root: classes.root, label: classes.label }}
			value={value}
			onChange={(val) =>
				(searchStateActions as { setSortBias?: (v: string | null) => void }).setSortBias?.(val)
			}
			data={[
				{ label: t('words.distance'), value: 'DISTANCE' },
				{ label: t('words.best-match'), value: 'RELEVANCE' },
			]}
			leftSection={<Icon icon='carbon:sort-ascending' height={16} />}
			size='sm'
		/>
	)
}
