import {
	ActionIcon,
	Alert,
	Box,
	Checkbox,
	Group,
	Menu,
	Pagination,
	Popover,
	Progress,
	Select,
	Table,
	Text,
	TextInput,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnSizingState,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	type PaginationState,
	type Row,
	type RowSelectionState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { type CSSProperties, type KeyboardEvent, type ReactNode, useCallback, useMemo, useState } from 'react'

import { Icon } from '~ui/icon'

import { ColumnFilterControl } from './ColumnFilterControl'
import classes from './DataTable.module.css'
import { type DataTableColumn, type DataTableDataMode, type DataTableFilterValue } from './types'
import { applyColumnFilters, applyGlobalFilter, applySorting, getColumnValue } from './utils'

export type { DataTableCellContext, DataTableColumn, DataTableFilter } from './types'
export type {
	ColumnFiltersState as DataTableColumnFiltersState,
	PaginationState as DataTablePaginationState,
	SortingState as DataTableSortingState,
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100]
const DEFAULT_PIN_WIDTH = 120
/** How many pixels a keyboard-driven resize (arrow keys on the resize handle) moves per keypress. */
const KEYBOARD_RESIZE_STEP = 10
const MIN_COLUMN_WIDTH = 40

/** No closure needed - a plain module-scope helper instead of an inline arrow in the JSX prop. */
const stopPropagation = (event: { stopPropagation: () => void }) => event.stopPropagation()

/**
 * Curried so `onClick={toggleColumnVisibility(col)}` calls `col.toggleVisibility()` with no arguments -
 * `toggleVisibility` takes an optional `boolean`, so passing it directly as the click handler
 * (`onClick={col.toggleVisibility}`) would call it with the click `MouseEvent` as that argument, which is
 * truthy and would always force visibility on instead of toggling it.
 */
const toggleColumnVisibility = (column: { toggleVisibility: () => void }) => () => column.toggleVisibility()

const getSortIcon = (sortDirection: false | 'asc' | 'desc'): string => {
	if (sortDirection === 'desc') {
		return 'carbon:chevron-down'
	}
	if (sortDirection === 'asc') {
		return 'carbon:chevron-up'
	}
	return 'carbon:chevron-sort'
}

export interface DataTableProps<T> {
	data: T[]
	columns: DataTableColumn<T>[]
	/** Stable row identity - defaults to array index, which is fine unless rows reorder across refetches. */
	getRowId?: (row: T, index: number) => string
	/** Enables row expansion (e.g. an organization's locations nested under it). */
	getSubRows?: (row: T) => T[] | undefined
	/**
	 * Optional-controlled, same idiom as `columnFilters` below - omit both to keep the previous fully-internal
	 * (uncontrolled) expand/collapse behavior every existing consumer already has. Pass both when a caller
	 * needs to seed/derive expansion itself (e.g. expand every row with a match once search results resolve,
	 * which can't be done with a mount-time-only initializer since data arrives async).
	 */
	expanded?: ExpandedState
	onExpandedChange?: (expanded: ExpandedState) => void

	sorting: SortingState
	onSortingChange: (sorting: SortingState) => void

	/** Omit for tables with no filterable columns - filtering stays permanently empty. */
	columnFilters?: ColumnFiltersState
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void

	globalFilter: string
	onGlobalFilterChange: (value: string) => void
	globalFilterPlaceholder?: string

	pagination: PaginationState
	onPaginationChange: (pagination: PaginationState) => void
	pageSizeOptions?: number[]

	/**
	 * Adding these three turns on a leading checkbox column (per-row cell + header "select all") - omit all
	 * three to keep every existing table exactly as it renders today. `enableRowSelection` is a per-row
	 * eligibility predicate (e.g. "only rows with a replaceable match"), not a table-wide on/off switch. Parent
	 * rows never cascade selection to their sub-rows (`enableSubRowSelection` is always `false` internally) - a
	 * table with expandable sub-rows needs the parent and each child selectable independently, never implied by
	 * the other.
	 */
	rowSelection?: RowSelectionState
	onRowSelectionChange?: (selection: RowSelectionState) => void
	enableRowSelection?: boolean | ((row: T) => boolean)

	/** Defaults to client mode: `data` is the full dataset and DataTable filters/sorts/paginates it itself. */
	mode?: DataTableDataMode

	isLoading?: boolean
	isFetching?: boolean
	isError?: boolean
	errorMessage?: string
	emptyMessage?: string

	toolbarExtra?: ReactNode
	showToolbar?: boolean
	showFooter?: boolean

	striped?: boolean
	maxHeight?: string | number
	minWidth?: string | number
	initialColumnVisibility?: Record<string, boolean>
	/** Applied to every cell's containing `<Table.Tr>` - e.g. dimming or striking through a deleted row. */
	getRowStyle?: (row: T) => CSSProperties | undefined
}

export const DataTable = <T,>({
	data,
	columns,
	getRowId,
	getSubRows,
	expanded: expandedProp,
	onExpandedChange: onExpandedChangeProp,
	sorting,
	onSortingChange,
	columnFilters = [],
	onColumnFiltersChange = () => undefined,
	globalFilter,
	onGlobalFilterChange,
	globalFilterPlaceholder = 'Search',
	pagination,
	onPaginationChange,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
	rowSelection = {},
	onRowSelectionChange,
	enableRowSelection = false,
	mode = { serverSide: false },
	isLoading,
	isFetching,
	isError,
	errorMessage = 'Error loading data',
	emptyMessage = 'No results',
	toolbarExtra,
	showToolbar = true,
	showFooter = true,
	striped = true,
	maxHeight = '65vh',
	minWidth = 900,
	initialColumnVisibility,
	getRowStyle,
}: DataTableProps<T>) => {
	const theme = useMantineTheme()
	// Lazy initializer - runs once on mount, matching `initialColumnVisibility`'s existing "initial
	// value only" semantics. `columns[].hiddenByDefault` previously had no effect at all: nothing
	// ever read it, so every column marked hidden-by-default rendered visible regardless.
	const [columnVisibility, setColumnVisibility] = useState(() => {
		const defaults: Record<string, boolean> = {}
		for (const column of columns) {
			if (column.hiddenByDefault) {
				defaults[column.id] = false
			}
		}
		return { ...defaults, ...initialColumnVisibility }
	})
	const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({})
	// Optional-controlled: omitting both expanded/onExpandedChange keeps every existing consumer's
	// previous fully-internal behavior; passing both lets a caller seed/derive expansion itself.
	const expanded = expandedProp ?? internalExpanded
	const handleExpandedChange = useCallback(
		(updater: ExpandedState | ((old: ExpandedState) => ExpandedState)) => {
			const next = typeof updater === 'function' ? updater(expanded) : updater
			if (onExpandedChangeProp) {
				onExpandedChangeProp(next)
			} else {
				setInternalExpanded(next)
			}
		},
		[expanded, onExpandedChangeProp]
	)
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
	const showSelectionColumn = Boolean(onRowSelectionChange)

	// Client mode does the filtering/sorting/pagination math itself, over the full `data` array; server
	// mode trusts the caller to have already sent back exactly the right page.
	const { pageRows, rowCount } = useMemo(() => {
		if (mode.serverSide) {
			return { pageRows: data, rowCount: mode.rowCount }
		}
		const filtered = applyColumnFilters(
			applyGlobalFilter(data, globalFilter, columns),
			columnFilters,
			columns
		)
		const sorted = applySorting(filtered, sorting, columns)
		const start = pagination.pageIndex * pagination.pageSize
		return { pageRows: sorted.slice(start, start + pagination.pageSize), rowCount: sorted.length }
	}, [mode, data, columns, globalFilter, columnFilters, sorting, pagination])

	const tanstackColumns = useMemo<ColumnDef<T>[]>(
		() =>
			columns.map(
				(column) =>
					({
						id: column.id,
						accessorFn: (row: T) => getColumnValue(row, column),
						header: () => column.header,
						cell: (ctx) =>
							column.cell
								? column.cell({
										row: ctx.row.original,
										value: ctx.getValue(),
										index: ctx.row.index,
										depth: ctx.row.depth,
										parentRow: ctx.row.getParentRow()?.original,
									})
								: String(ctx.getValue() ?? ''),
						enableSorting: column.enableSorting ?? true,
						size: column.size,
					}) satisfies ColumnDef<T>
			),
		[columns]
	)

	const pageCount = Math.max(1, Math.ceil(rowCount / pagination.pageSize))

	// Extracted (rather than inlined in the JSX below) so the filter-recomputation logic isn't
	// nested 5 levels deep (component > header row map > header map > Popover > onChange).
	const handleColumnFilterChange = useCallback(
		(columnId: string) => (value: DataTableFilterValue | undefined) => {
			const rest = columnFilters.filter((f) => f.id !== columnId)
			onColumnFiltersChange(value === undefined ? rest : [...rest, { id: columnId, value }])
		},
		[columnFilters, onColumnFiltersChange]
	)

	const handleGlobalFilterChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => onGlobalFilterChange(event.currentTarget.value),
		[onGlobalFilterChange]
	)

	const handlePageSizeChange = useCallback(
		(value: string | null) => {
			if (value) {
				onPaginationChange({ pageIndex: 0, pageSize: Number(value) })
			}
		},
		[onPaginationChange]
	)

	const handlePageChange = useCallback(
		(page: number) => onPaginationChange({ ...pagination, pageIndex: page - 1 }),
		[onPaginationChange, pagination]
	)

	// Keyboard equivalent of dragging the resize handle - `getResizeHandler()` only wires up
	// mouse/touch, so this is the sole way a keyboard user can resize a column.
	const handleResizeKeyDown = useCallback(
		(columnId: string, currentSize: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
			if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
				return
			}
			event.preventDefault()
			const delta = event.key === 'ArrowLeft' ? -KEYBOARD_RESIZE_STEP : KEYBOARD_RESIZE_STEP
			setColumnSizing((prev) => ({
				...prev,
				[columnId]: Math.max(MIN_COLUMN_WIDTH, currentSize + delta),
			}))
		},
		[]
	)

	const table = useReactTable({
		data: pageRows,
		columns: tanstackColumns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
			pagination,
			columnVisibility,
			expanded,
			columnSizing,
			rowSelection,
		},
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
		enableRowSelection:
			typeof enableRowSelection === 'function'
				? (row: Row<T>) => enableRowSelection(row.original)
				: enableRowSelection,
		// Org rows and their expanded sub-rows must be selectable independently - a parent's checkbox
		// must never imply or cascade to its children.
		enableSubRowSelection: false,
		getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getSubRows ? getExpandedRowModel() : undefined,
		onSortingChange: (updater) => onSortingChange(typeof updater === 'function' ? updater(sorting) : updater),
		onColumnFiltersChange: (updater) =>
			onColumnFiltersChange(typeof updater === 'function' ? updater(columnFilters) : updater),
		onGlobalFilterChange: (updater) =>
			onGlobalFilterChange(typeof updater === 'function' ? updater(globalFilter) : updater),
		onPaginationChange: (updater) =>
			onPaginationChange(typeof updater === 'function' ? updater(pagination) : updater),
		onColumnVisibilityChange: setColumnVisibility,
		onExpandedChange: handleExpandedChange,
		onColumnSizingChange: setColumnSizing,
		onRowSelectionChange: (updater) =>
			onRowSelectionChange?.(typeof updater === 'function' ? updater(rowSelection) : updater),
		pageCount,
		getSubRows,
	})

	const leafColumns = table.getVisibleLeafColumns()
	const pinOffsets = useMemo(() => {
		const offsets = new Map<string, number>()
		let cumulative = 0
		for (const col of leafColumns) {
			const columnDef = columns.find((c) => c.id === col.id)
			if (columnDef?.pin !== 'left') {
				break
			}
			offsets.set(col.id, cumulative)
			cumulative += col.getSize() || DEFAULT_PIN_WIDTH
		}
		return offsets
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leafColumns, columns, columnSizing])

	const stickyStyle = (columnId: string) => {
		if (!pinOffsets.has(columnId)) {
			return undefined
		}
		return {
			position: 'sticky' as const,
			left: pinOffsets.get(columnId),
			zIndex: 2,
			background: 'var(--mantine-color-body)',
		}
	}

	const alertBanner = isError ? (
		<Alert color='red' mb='sm'>
			{errorMessage}
		</Alert>
	) : null

	return (
		<div>
			{showToolbar && (
				<Group justify='space-between' mb='sm' wrap='nowrap'>
					<TextInput
						placeholder={globalFilterPlaceholder}
						value={globalFilter}
						onChange={handleGlobalFilterChange}
						leftSection={<Icon icon='carbon:search' height={16} />}
						w={280}
					/>
					<Group wrap='nowrap' gap='xs'>
						{toolbarExtra}
						<Menu closeOnItemClick={false} position='bottom-end'>
							<Menu.Target>
								<Tooltip label='Show/hide columns'>
									<ActionIcon variant='subtle' aria-label='Show/hide columns'>
										<Icon icon='carbon:column' />
									</ActionIcon>
								</Tooltip>
							</Menu.Target>
							<Menu.Dropdown>
								{table
									.getAllLeafColumns()
									.filter((col) => columns.find((c) => c.id === col.id)?.hideable !== false)
									.map((col) => {
										const label = columns.find((c) => c.id === col.id)?.header
										return (
											<Menu.Item
												key={col.id}
												onClick={toggleColumnVisibility(col)}
												leftSection={
													<Icon icon={col.getIsVisible() ? 'carbon:checkbox-checked' : 'carbon:checkbox'} />
												}
											>
												{typeof label === 'string' ? label : col.id}
											</Menu.Item>
										)
									})}
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>
			)}

			{alertBanner}
			<Progress value={100} size={2} striped animated style={{ opacity: isFetching || isLoading ? 1 : 0 }} />

			<Table.ScrollContainer minWidth={minWidth} maxHeight={maxHeight}>
				<Table striped={striped} highlightOnHover stickyHeader layout='fixed' className={classes.table}>
					<Table.Thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Tr key={headerGroup.id}>
								{showSelectionColumn && (
									<Table.Th style={{ width: 32 }} className={classes.th}>
										<Checkbox
											size='sm'
											checked={table.getIsAllRowsSelected()}
											indeterminate={table.getIsSomeRowsSelected()}
											onChange={table.getToggleAllRowsSelectedHandler()}
											aria-label='Select all rows'
										/>
									</Table.Th>
								)}
								{headerGroup.headers.map((header) => {
									const columnDef = columns.find((c) => c.id === header.column.id)
									const activeFilter = columnFilters.find((f) => f.id === header.column.id)
									const sortDirection = header.column.getIsSorted()
									const sortIcon = getSortIcon(sortDirection)
									const resizeLabel =
										typeof columnDef?.header === 'string' ? columnDef.header : header.column.id
									return (
										<Table.Th
											key={header.id}
											style={{ ...stickyStyle(header.column.id), width: header.getSize() }}
											className={classes.th}
										>
											<Group
												gap={4}
												wrap='nowrap'
												justify={columnDef?.align === 'right' ? 'flex-end' : 'flex-start'}
											>
												<Text
													fw={600}
													size='sm'
													onClick={header.column.getToggleSortingHandler()}
													className={header.column.getCanSort() ? classes.sortable : undefined}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
												</Text>
												{header.column.getCanSort() && (
													<Icon
														icon={sortIcon}
														height={14}
														color={sortDirection ? undefined : theme.other.colors.secondary.darkGray}
														onClick={header.column.getToggleSortingHandler()}
														className={classes.sortable}
													/>
												)}
												{columnDef?.filter && (
													<Popover position='bottom-start' withArrow shadow='md'>
														<Popover.Target>
															<ActionIcon
																variant={activeFilter ? 'light' : 'subtle'}
																size='sm'
																aria-label={`Filter ${columnDef.id}`}
															>
																<Icon icon='carbon:filter' height={14} />
															</ActionIcon>
														</Popover.Target>
														<Popover.Dropdown>
															<ColumnFilterControl
																label={typeof columnDef.header === 'string' ? columnDef.header : columnDef.id}
																filter={columnDef.filter}
																value={activeFilter?.value as DataTableFilterValue | undefined}
																onChange={handleColumnFilterChange(columnDef.id)}
															/>
														</Popover.Dropdown>
													</Popover>
												)}
											</Group>
											<button
												type='button'
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												onClick={stopPropagation}
												onKeyDown={handleResizeKeyDown(header.column.id, header.column.getSize())}
												aria-label={`Resize ${resizeLabel} column (${header.column.getSize()} pixels)`}
												className={classes.resizer}
												data-resizing={header.column.getIsResizing() || undefined}
											/>
										</Table.Th>
									)
								})}
							</Table.Tr>
						))}
					</Table.Thead>
					<Table.Tbody>
						{table.getRowModel().rows.length === 0 && (
							<Table.Tr>
								<Table.Td colSpan={leafColumns.length + (showSelectionColumn ? 1 : 0)}>
									<Text c='dimmed' ta='center' py='md'>
										{emptyMessage}
									</Text>
								</Table.Td>
							</Table.Tr>
						)}
						{table.getRowModel().rows.map((row) => (
							<Table.Tr key={row.id} style={getRowStyle?.(row.original)}>
								{showSelectionColumn && (
									<Table.Td className={classes.td}>
										<Checkbox
											size='sm'
											checked={row.getIsSelected()}
											disabled={!row.getCanSelect()}
											onChange={row.getToggleSelectedHandler()}
											aria-label={row.getIsSelected() ? 'Deselect row' : 'Select row'}
										/>
									</Table.Td>
								)}
								{row.getVisibleCells().map((cell, cellIndex) => {
									const columnDef = columns.find((c) => c.id === cell.column.id)
									const isFirstCell = cellIndex === 0
									return (
										<Table.Td
											key={cell.id}
											style={{ ...stickyStyle(cell.column.id), width: cell.column.getSize() }}
											ta={columnDef?.align}
											className={classes.td}
										>
											<Group gap={4} wrap='nowrap' pl={isFirstCell ? row.depth * 20 : undefined}>
												{isFirstCell && getSubRows && (
													<Box w={20}>
														{row.getCanExpand() && (
															<ActionIcon
																variant='subtle'
																size='sm'
																onClick={row.getToggleExpandedHandler()}
																aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
															>
																<Icon
																	icon={row.getIsExpanded() ? 'carbon:chevron-down' : 'carbon:chevron-right'}
																	height={14}
																	color={theme.other.colors.primary.allyGreen}
																/>
															</ActionIcon>
														)}
													</Box>
												)}
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</Group>
										</Table.Td>
									)
								})}
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>

			{showFooter && (
				<Group justify='space-between' mt='sm'>
					<Text size='sm' c='dimmed'>
						{rowCount === 0
							? emptyMessage
							: `Showing ${pagination.pageIndex * pagination.pageSize + 1}-${Math.min(
									(pagination.pageIndex + 1) * pagination.pageSize,
									rowCount
								)} of ${rowCount}`}
					</Text>
					<Group gap='xl' wrap='nowrap'>
						<Group gap={8} wrap='nowrap'>
							<Text size='sm' c='dimmed'>
								Rows per page
							</Text>
							<Select
								aria-label='Rows per page'
								value={String(pagination.pageSize)}
								onChange={handlePageSizeChange}
								data={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
								size='xs'
								w={70}
								allowDeselect={false}
							/>
						</Group>
						<Pagination
							value={pagination.pageIndex + 1}
							onChange={handlePageChange}
							total={pageCount}
							size='sm'
						/>
					</Group>
				</Group>
			)}
		</div>
	)
}
