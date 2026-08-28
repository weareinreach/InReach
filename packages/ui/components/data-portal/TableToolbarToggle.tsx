import { ActionIcon, Tooltip } from '@mantine/core'
import { type ColumnFiltersState } from '@tanstack/react-table'
import { useCallback } from 'react'

import { Icon } from '~ui/icon'

import classes from './TableToolbarToggle.module.css'

export interface TableToolbarToggleProps {
	/** Column whose filter value this button cycles through. */
	columnId: string
	columnFilters: ColumnFiltersState
	setColumnFilters: (updater: (prev: ColumnFiltersState) => ColumnFiltersState) => void
	/** The sequence of filter states a click advances through, looping back to the start. */
	cycle: [boolean | undefined, boolean | undefined, boolean | undefined]
	label: (state: boolean | undefined) => string
	icon: (state: boolean | undefined) => string
	/**
	 * Overlays a diagonal line across the icon for the given state - for icons with no dedicated
	 * "off"/"excluded" variant in the icon set (e.g. `carbon:trash-can` has no `trash-can-off`).
	 */
	slash?: (state: boolean | undefined) => boolean
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
	slash,
}: TableToolbarToggleProps) => {
	const current = columnFilters.find(({ id }) => id === columnId)?.value as boolean | undefined
	const currentIndex = cycle.indexOf(current)

	const toggle = useCallback(() => {
		const next = cycle[(currentIndex + 1) % cycle.length]
		setColumnFilters((prev) =>
			next === undefined
				? prev.filter(({ id }) => id !== columnId)
				: [...prev.filter(({ id }) => id !== columnId), { id: columnId, value: next }]
		)
	}, [cycle, currentIndex, columnId, setColumnFilters])

	return (
		<Tooltip label={label(current)}>
			<ActionIcon onClick={toggle} variant='subtle'>
				<span className={slash?.(current) ? classes.slash : undefined}>
					<Icon icon={icon(current)} height={20} />
				</span>
			</ActionIcon>
		</Tooltip>
	)
}
