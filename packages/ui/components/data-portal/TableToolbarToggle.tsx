import { ActionIcon, Tooltip } from '@mantine/core'
import { type ColumnFiltersState } from '@tanstack/react-table'

import { Icon } from '~ui/icon'

export interface TableToolbarToggleProps {
	/** Column whose filter value this button cycles through. */
	columnId: string
	columnFilters: ColumnFiltersState
	setColumnFilters: (updater: (prev: ColumnFiltersState) => ColumnFiltersState) => void
	/** The sequence of filter states a click advances through, looping back to the start. */
	cycle: [boolean | undefined, boolean | undefined, boolean | undefined]
	label: (state: boolean | undefined) => string
	icon: (state: boolean | undefined) => string
}

/**
 * A three-state toolbar toggle for boolean columns (e.g. published/deleted, visible/hidden) - clicking cycles
 * through `cycle` in order, setting or clearing that column's filter accordingly.
 */
export const TableToolbarToggle = ({
	columnId,
	columnFilters,
	setColumnFilters,
	cycle,
	label,
	icon,
}: TableToolbarToggleProps) => {
	const current = columnFilters.find(({ id }) => id === columnId)?.value as boolean | undefined
	const currentIndex = cycle.indexOf(current)

	const toggle = () => {
		const next = cycle[(currentIndex + 1) % cycle.length]
		setColumnFilters((prev) =>
			next === undefined
				? prev.filter(({ id }) => id !== columnId)
				: [...prev.filter(({ id }) => id !== columnId), { id: columnId, value: next }]
		)
	}

	return (
		<Tooltip label={label(current)}>
			<ActionIcon onClick={toggle} variant='subtle'>
				<Icon icon={icon(current)} height={20} />
			</ActionIcon>
		</Tooltip>
	)
}
