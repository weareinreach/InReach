import { type ColumnFiltersState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'

import { type DataTableColumn, type DataTableFilter, type DataTableFilterValue } from './types'

export const getColumnValue = <T>(row: T, column: DataTableColumn<T>) =>
	column.accessorFn ? column.accessorFn(row) : (row as Record<string, unknown>)[column.id]

/**
 * `String(x)` on a non-primitive silently produces `'[object Object]'` - handle the shapes column values can
 * actually take.
 */
const toSearchableString = (value: unknown): string => {
	if (value == null) {
		return ''
	}
	if (value instanceof Date) {
		return value.toISOString()
	}
	if (typeof value === 'object') {
		return JSON.stringify(value)
	}
	return String(value as string | number | boolean)
}

export const applyGlobalFilter = <T>(rows: T[], search: string, columns: DataTableColumn<T>[]): T[] => {
	const query = search.trim().toLowerCase()
	if (!query) {
		return rows
	}
	const searchableColumns = columns.filter((col) => col.enableGlobalFilter !== false)
	return rows.filter((row) =>
		searchableColumns.some((col) =>
			toSearchableString(getColumnValue(row, col)).toLowerCase().includes(query)
		)
	)
}

const filterByText = <T>(rows: T[], column: DataTableColumn<T>, rawQuery: unknown): T[] => {
	const query = toSearchableString(rawQuery).trim().toLowerCase()
	if (!query) {
		return rows
	}
	return rows.filter((row) => toSearchableString(getColumnValue(row, column)).toLowerCase().includes(query))
}

const filterByCheckbox = <T>(rows: T[], column: DataTableColumn<T>, rawValue: unknown): T[] => {
	if (typeof rawValue !== 'boolean') {
		return rows
	}
	return rows.filter((row) => Boolean(getColumnValue(row, column)) === rawValue)
}

const filterBySelect = <T>(rows: T[], column: DataTableColumn<T>, rawValue: unknown): T[] => {
	if (!rawValue) {
		return rows
	}
	return rows.filter((row) => getColumnValue(row, column) === rawValue)
}

const filterByMultiSelect = <T>(rows: T[], column: DataTableColumn<T>, rawValue: unknown): T[] => {
	const values = Array.isArray(rawValue) ? (rawValue as string[]) : []
	if (!values.length) {
		return rows
	}
	return rows.filter((row) => values.includes(getColumnValue(row, column) as string))
}

const toDateOrNull = (rawValue: unknown): Date | null => {
	if (rawValue instanceof Date) {
		return rawValue
	}
	if (typeof rawValue === 'string' || typeof rawValue === 'number') {
		return new Date(rawValue)
	}
	return null
}

const filterByDateRange = <T>(rows: T[], column: DataTableColumn<T>, rawValue: unknown): T[] => {
	const [from, to] = Array.isArray(rawValue)
		? (rawValue as [Date | undefined, Date | undefined])
		: [undefined, undefined]
	if (!from && !to) {
		return rows
	}
	return rows.filter((row) => {
		const value = toDateOrNull(getColumnValue(row, column))
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
				return filterByText(acc, column, filter.value)
			}
			case 'checkbox': {
				return filterByCheckbox(acc, column, filter.value)
			}
			case 'select': {
				return filterBySelect(acc, column, filter.value)
			}
			case 'multi-select': {
				return filterByMultiSelect(acc, column, filter.value)
			}
			case 'date-range': {
				return filterByDateRange(acc, column, filter.value)
			}
			default: {
				return acc
			}
		}
	}, rows)

const compareValues = <T>(a: T, b: T, id: string, desc: boolean, columns: DataTableColumn<T>[]): number => {
	const column = columns.find((col) => col.id === id)
	if (!column) {
		return 0
	}
	const aValue = getColumnValue(a, column)
	const bValue = getColumnValue(b, column)
	if (aValue == null && bValue == null) {
		return 0
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
	return 0
}

const formatFilterDate = (date: Date) => DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_SHORT)

const describeTextFilter = (value: DataTableFilterValue): string | null =>
	typeof value === 'string' && value ? value : null

const describeCheckboxFilter = (
	filter: Extract<DataTableFilter, { type: 'checkbox' }>,
	value: DataTableFilterValue
): string | null => {
	if (typeof value !== 'boolean') {
		return null
	}
	return value ? (filter.trueLabel ?? 'Yes') : (filter.falseLabel ?? 'No')
}

const describeSelectFilter = (
	filter: Extract<DataTableFilter, { type: 'select' }>,
	value: DataTableFilterValue
): string | null => {
	if (typeof value !== 'string') {
		return null
	}
	return filter.options.find((option) => option.value === value)?.label ?? value
}

const describeMultiSelectFilter = (
	filter: Extract<DataTableFilter, { type: 'multi-select' }>,
	value: DataTableFilterValue
): string | null => {
	if (!Array.isArray(value) || !value.length) {
		return null
	}
	return (value as string[])
		.map((v) => filter.options.find((option) => option.value === v)?.label ?? v)
		.join(', ')
}

const describeDateRangeFilter = (value: DataTableFilterValue): string | null => {
	if (!Array.isArray(value)) {
		return null
	}
	const [from, to] = value as [Date | undefined, Date | undefined]
	if (!from && !to) {
		return null
	}
	if (from && to) {
		return `${formatFilterDate(from)} – ${formatFilterDate(to)}`
	}
	return from ? `after ${formatFilterDate(from)}` : `before ${formatFilterDate(to as Date)}`
}

const describeUserSearchFilter = (value: DataTableFilterValue): string | null => {
	if (!Array.isArray(value) || !value.length) {
		return null
	}
	return (value as { id: string; label: string }[]).map((person) => person.label).join(', ')
}

/**
 * Turns one active column filter's raw value into a short, human-readable string for the "applied filters"
 * summary above the table - e.g. a `multi-select` value is a list of raw option values, not the labels a
 * person actually picked, so this looks those back up via the same `filter.options` the control itself
 * renders from. Returns `null` for an empty/unset value so the caller can skip it entirely.
 */
export const describeFilterValue = (
	filter: DataTableFilter,
	value: DataTableFilterValue | undefined
): string | null => {
	if (value === undefined) {
		return null
	}
	switch (filter.type) {
		case 'text': {
			return describeTextFilter(value)
		}
		case 'checkbox': {
			return describeCheckboxFilter(filter, value)
		}
		case 'select': {
			return describeSelectFilter(filter, value)
		}
		case 'multi-select': {
			return describeMultiSelectFilter(filter, value)
		}
		case 'date-range': {
			return describeDateRangeFilter(value)
		}
		case 'user-search': {
			return describeUserSearchFilter(value)
		}
		default: {
			return null
		}
	}
}

export const applySorting = <T>(rows: T[], sorting: SortingState, columns: DataTableColumn<T>[]): T[] => {
	if (!sorting.length) {
		return rows
	}
	return [...rows].sort((a, b) => {
		for (const { id, desc } of sorting) {
			const result = compareValues(a, b, id, desc, columns)
			if (result !== 0) {
				return result
			}
		}
		return 0
	})
}
