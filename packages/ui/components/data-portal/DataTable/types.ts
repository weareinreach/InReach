import { type ReactNode } from 'react'

export type DataTableFilter =
	| { type: 'text' }
	| { type: 'checkbox'; trueLabel?: string; falseLabel?: string }
	| { type: 'select'; options: { value: string; label: string }[] }
	| { type: 'multi-select'; options: { value: string; label: string }[] }
	| { type: 'date-range' }

/**
 * Shape actually stored per active filter - kept as `unknown` to match `@tanstack/react-table`'s own
 * `ColumnFiltersState`; each `ColumnFilterControl` branch owns interpreting its own value's real shape.
 */
export type DataTableFilterValue = string | boolean | string[] | [Date | undefined, Date | undefined]

export interface DataTableCellContext<T> {
	row: T
	value: unknown
	index: number
	depth: number
}

export interface DataTableColumn<T> {
	/** Unique column id. Also used as the data key when `accessorFn` is omitted. */
	id: string
	header: ReactNode
	/** Reads the raw value used for sorting/filtering/global-search and passed to `cell`. Defaults to `row[id]`. */
	accessorFn?: (row: T) => unknown
	/** Custom cell renderer. Defaults to stringifying the accessed value. */
	cell?: (ctx: DataTableCellContext<T>) => ReactNode
	/** Declares this column's filter UI and how it should be evaluated. Omit for a non-filterable column. */
	filter?: DataTableFilter
	/** Whether this column participates in the global search box. Ignored if the column has no plain-text value. */
	enableGlobalFilter?: boolean
	enableSorting?: boolean
	size?: number
	align?: 'left' | 'center' | 'right'
	/** Sticks the column (and everything pinned before it) to the left edge of the scroll container. */
	pin?: 'left'
	/** Hidden by default, but still toggleable from the column-visibility menu. */
	hiddenByDefault?: boolean
	/**
	 * Removes this column from the visibility menu entirely - it's always shown/hidden by `hiddenByDefault`
	 * alone.
	 */
	hideable?: boolean
}

interface DataTableClientDataMode {
	serverSide?: false
}

interface DataTableServerDataMode {
	/** Marks filtering/sorting/pagination as already applied server-side - `data` is rendered as-is. */
	serverSide: true
	/** Total row count across all pages/filters - required to size the pagination control in server mode. */
	rowCount: number
}

export type DataTableDataMode = DataTableClientDataMode | DataTableServerDataMode
