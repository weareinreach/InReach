import {
	ActionIcon,
	Alert,
	Box,
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
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { type CSSProperties, type ReactNode, useMemo, useState } from 'react'

import { Icon } from '~ui/icon'

import { ColumnFilterControl } from './ColumnFilterControl'
import classes from './DataTable.module.css'
import { type DataTableColumn, type DataTableDataMode, type DataTableFilterValue } from './types'
import { applyColumnFilters, applyGlobalFilter, applySorting, getColumnValue } from './utils'

export type { DataTableColumn, DataTableFilter } from './types'
export type {
	ColumnFiltersState as DataTableColumnFiltersState,
	PaginationState as DataTablePaginationState,
	SortingState as DataTableSortingState,
}

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100]
const DEFAULT_PIN_WIDTH = 120

export interface DataTableProps<T> {
	data: T[]
	columns: DataTableColumn<T>[]
	/** Stable row identity - defaults to array index, which is fine unless rows reorder across refetches. */
	getRowId?: (row: T, index: number) => string
	/** Enables row expansion (e.g. an organization's locations nested under it). */
	getSubRows?: (row: T) => T[] | undefined

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
	const [expanded, setExpanded] = useState<ExpandedState>({})

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
									})
								: String(ctx.getValue() ?? ''),
						enableSorting: column.enableSorting ?? true,
						size: column.size,
					}) satisfies ColumnDef<T>
			),
		[columns]
	)

	const pageCount = Math.max(1, Math.ceil(rowCount / pagination.pageSize))

	const table = useReactTable({
		data: pageRows,
		columns: tanstackColumns,
		state: { sorting, columnFilters, globalFilter, pagination, columnVisibility, expanded },
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
		pageCount,
		getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
		getSubRows,
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
		onExpandedChange: setExpanded,
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
			cumulative += columnDef.size ?? DEFAULT_PIN_WIDTH
		}
		return offsets
	}, [leafColumns, columns])

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
						onChange={(event) => onGlobalFilterChange(event.currentTarget.value)}
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
												onClick={() => col.toggleVisibility()}
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
				<Table striped={striped} highlightOnHover stickyHeader className={classes.table}>
					<Table.Thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const columnDef = columns.find((c) => c.id === header.column.id)
									const activeFilter = columnFilters.find((f) => f.id === header.column.id)
									return (
										<Table.Th
											key={header.id}
											style={{ ...stickyStyle(header.column.id), width: columnDef?.size }}
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
														icon={
															header.column.getIsSorted() === 'desc'
																? 'carbon:chevron-down'
																: header.column.getIsSorted() === 'asc'
																	? 'carbon:chevron-up'
																	: 'carbon:chevron-sort'
														}
														height={14}
														color={
															header.column.getIsSorted() ? undefined : theme.other.colors.secondary.darkGray
														}
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
																onChange={(value) => {
																	const rest = columnFilters.filter((f) => f.id !== columnDef.id)
																	onColumnFiltersChange(
																		value === undefined ? rest : [...rest, { id: columnDef.id, value }]
																	)
																}}
															/>
														</Popover.Dropdown>
													</Popover>
												)}
											</Group>
										</Table.Th>
									)
								})}
							</Table.Tr>
						))}
					</Table.Thead>
					<Table.Tbody>
						{table.getRowModel().rows.length === 0 && (
							<Table.Tr>
								<Table.Td colSpan={leafColumns.length}>
									<Text c='dimmed' ta='center' py='md'>
										{emptyMessage}
									</Text>
								</Table.Td>
							</Table.Tr>
						)}
						{table.getRowModel().rows.map((row) => (
							<Table.Tr key={row.id} style={getRowStyle?.(row.original)}>
								{row.getVisibleCells().map((cell, cellIndex) => {
									const columnDef = columns.find((c) => c.id === cell.column.id)
									const isFirstCell = cellIndex === 0
									return (
										<Table.Td
											key={cell.id}
											style={stickyStyle(cell.column.id)}
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
					<Group gap='sm'>
						<Select
							value={String(pagination.pageSize)}
							onChange={(value) => value && onPaginationChange({ pageIndex: 0, pageSize: Number(value) })}
							data={pageSizeOptions.map((size) => ({ value: String(size), label: `${size} / page` }))}
							size='xs'
							w={110}
							allowDeselect={false}
						/>
						<Pagination
							value={pagination.pageIndex + 1}
							onChange={(page) => onPaginationChange({ ...pagination, pageIndex: page - 1 })}
							total={pageCount}
							size='sm'
						/>
					</Group>
				</Group>
			)}
		</div>
	)
}
