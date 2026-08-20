import { type ColumnFiltersState, type SortingState } from '@tanstack/react-table'

import { type DataTableColumn } from './types'

export const getColumnValue = <T>(row: T, column: DataTableColumn<T>) =>
	column.accessorFn ? column.accessorFn(row) : (row as Record<string, unknown>)[column.id]

export const applyGlobalFilter = <T>(rows: T[], search: string, columns: DataTableColumn<T>[]): T[] => {
	const query = search.trim().toLowerCase()
	if (!query) {
		return rows
	}
	const searchableColumns = columns.filter((col) => col.enableGlobalFilter !== false)
	return rows.filter((row) =>
		searchableColumns.some((col) =>
			String(getColumnValue(row, col) ?? '')
				.toLowerCase()
				.includes(query)
		)
	)
}

export const applyColumnFilters = <T>(
	rows: T[],
	filters: ColumnFiltersState,
	columns: DataTableColumn<T>[]
): T[] =>
	filters.reduce((acc, filter) => {
		const column = columns.find((col) => col.id === filter.id)
		if (!column?.filter) {
			return acc
		}
		switch (column.filter.type) {
			case 'text': {
				const query = String(filter.value ?? '')
					.trim()
					.toLowerCase()
				if (!query) {
					return acc
				}
				return acc.filter((row) =>
					String(getColumnValue(row, column) ?? '')
						.toLowerCase()
						.includes(query)
				)
			}
			case 'checkbox': {
				if (typeof filter.value !== 'boolean') {
					return acc
				}
				const wantChecked = filter.value
				return acc.filter((row) => Boolean(getColumnValue(row, column)) === wantChecked)
			}
			case 'select': {
				if (!filter.value) {
					return acc
				}
				return acc.filter((row) => getColumnValue(row, column) === filter.value)
			}
			case 'multi-select': {
				const values = Array.isArray(filter.value) ? (filter.value as string[]) : []
				if (!values.length) {
					return acc
				}
				return acc.filter((row) => values.includes(getColumnValue(row, column) as string))
			}
			case 'date-range': {
				const [from, to] = Array.isArray(filter.value)
					? (filter.value as [Date | undefined, Date | undefined])
					: [undefined, undefined]
				if (!from && !to) {
					return acc
				}
				return acc.filter((row) => {
					const rawValue = getColumnValue(row, column)
					const value =
						rawValue instanceof Date
							? rawValue
							: typeof rawValue === 'string' || typeof rawValue === 'number'
								? new Date(rawValue)
								: null
					if (!value) {
						return false
					}
					if (from && value < from) {
						return false
					}
					if (to && value > to) {
						return false
					}
					return true
				})
			}
			default: {
				return acc
			}
		}
	}, rows)

export const applySorting = <T>(rows: T[], sorting: SortingState, columns: DataTableColumn<T>[]): T[] => {
	if (!sorting.length) {
		return rows
	}
	return [...rows].sort((a, b) => {
		for (const { id, desc } of sorting) {
			const column = columns.find((col) => col.id === id)
			if (!column) {
				continue
			}
			const aValue = getColumnValue(a, column)
			const bValue = getColumnValue(b, column)
			if (aValue == null && bValue == null) {
				continue
			}
			if (aValue == null) {
				return desc ? -1 : 1
			}
			if (bValue == null) {
				return desc ? 1 : -1
			}
			if (aValue < bValue) {
				return desc ? 1 : -1
			}
			if (aValue > bValue) {
				return desc ? -1 : 1
			}
		}
		return 0
	})
}
