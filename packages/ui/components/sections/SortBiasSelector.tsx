import { createStyles, Select } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	root: {
		minWidth: 180,
	},
	label: {
		fontWeight: 700,
		fontSize: theme.fontSizes.xs,
		textTransform: 'uppercase',
		color: theme.other.colors.secondary.darkGray,
		marginBottom: 4,
	},
}))

export const SortBiasSelector = () => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const { searchState, searchStateActions } = useSearchState()

	// @ts-expect-error evolving searchState
	const value = searchState.sortBias || 'DISTANCE'

	return (
		<Select
			label={t('words.sort-by')}
			classNames={{ root: classes.root, label: classes.label }}
			value={value}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onChange={(val) => (searchStateActions as any).setSortBias?.(val)}
			data={[
				{ label: t('words.distance'), value: 'DISTANCE' },
				{ label: t('words.best-match'), value: 'RELEVANCE' },
			]}
			icon={<Icon icon='carbon:sort-ascending' height={16} />}
			size='sm'
		/>
	)
}
