import { createStyles, Group, rem, Tooltip, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFilterFnsState,
	type MRT_ColumnFiltersState,
	type MRT_SortingState,
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { type Dispatch, type SetStateAction, useMemo, useRef, useState } from 'react'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	table: {
		minWidth: '80%',
	},
}))

const ToolbarButtons = ({ columnFilters, setColumnFilters }: ToolbarButtonsProps) => {
	const theme = useMantineTheme()
	const toggle = (key: 'published' | 'deleted') => {
		const current = columnFilters.find(({ id }) => key === id)
		const options = key === 'published' ? [undefined, true, false] : [false, true, undefined]
		const currentIdx = options.indexOf(current?.value as boolean | undefined)
		const nextIdx = (currentIdx + 1) % options.length
		setColumnFilters((prev) =>
			options[nextIdx] === undefined
				? prev.filter(({ id }) => id !== key)
				: [...prev.filter(({ id }) => id !== key), { id: key, value: options[nextIdx] }]
		)
	}
	const publishedState = columnFilters.find(({ id }) => id === 'published')?.value as boolean | undefined
	const deletedState = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined

	return (
		<>
			<Group>
				<Tooltip
					label={
						publishedState
							? 'Show only unpublished'
							: publishedState === undefined
							? 'Show only published'
							: 'Show all'
					}
				>
					<Icon
						icon={
							publishedState
								? 'carbon:view-filled'
								: publishedState === undefined
								? 'carbon:view'
								: 'carbon:view-off-filled'
						}
						style={{
							color: publishedState === undefined ? theme.other.colors.secondary.darkGray : undefined,
						}}
						height={24}
						onClick={() => toggle('published')}
					/>
				</Tooltip>
				<Tooltip
					label={deletedState ? 'Show all' : deletedState === undefined ? 'Hide deleted' : 'Show deleted'}
				>
					<Group onClick={() => toggle('deleted')}>
						<Icon
							icon='carbon:trash-can'
							style={{
								color: deletedState === undefined ? theme.other.colors.secondary.darkGray : undefined,
							}}
							height={24}
						/>
						<Icon
							icon='carbon:close'
							height={40}
							style={{
								position: 'relative',
								right: rem(48),
								marginRight: rem(-48),
								opacity: deletedState === false ? 1 : 0,
							}}
						/>
					</Group>
				</Tooltip>
			</Group>
		</>
	)
}

export const OrganizationTable = () => {
	const { classes } = useStyles()
	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(undefined, {
		placeholderData: [],
		select: (data) => data.map(({ locations, ...rest }) => ({ ...rest, subRows: locations })),
	})

	const columns = useMemo<MRT_ColumnDef<NonNullable<typeof data>[number]>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				columnFilterModeOptions: ['contains', 'fuzzy', 'startsWith', 'endsWith'],
				filterVariant: 'autocomplete',
				enableResizing: true,
				minSize: 250,
			},
			{
				accessorKey: 'lastVerified',
				header: 'Verified',
				Cell: ({ cell }) => {
					if (!cell.getValue<Date>()) return null
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATE_HUGE)} withinPortal>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
				columnFilterModeOptions: ['betweenInclusive'],
				filterVariant: 'date-range',
				enableColumnFilterModes: false,
				size: 150,
			},
			{
				accessorKey: 'updatedAt',
				header: 'Updated',
				Cell: ({ cell }) => {
					if (!cell.getValue<Date>()) return null
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
				columnFilterModeOptions: ['betweenInclusive'],
				filterVariant: 'date-range',
				enableColumnFilterModes: false,
				size: 150,
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				Cell: ({ cell }) => {
					if (!cell.getValue<Date>()) return null
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
				columnFilterModeOptions: ['betweenInclusive'],
				filterVariant: 'date-range',
				enableColumnFilterModes: false,
				size: 150,
			},
			{
				accessorKey: 'published',
				header: 'Published',
				Cell: ({ cell }) => cell.getValue<boolean>().toString(),
				columnFilterModeOptions: ['equals'],
				filterVariant: 'checkbox',
				enableColumnFilterModes: false,
				mantineFilterCheckboxProps: { label: 'Published?' },
				enableSorting: false,
				enableColumnActions: false,
				size: 110,
			},
			{
				accessorKey: 'deleted',
				header: 'Deleted',
				Cell: ({ cell }) => cell.getValue<boolean>().toString(),
				columnFilterModeOptions: ['equals'],
				filterVariant: 'checkbox',
				enableColumnFilterModes: false,
				mantineFilterCheckboxProps: { label: 'Deleted?' },
				enableSorting: false,
				enableColumnActions: false,
				size: 100,
			},
		],
		[]
	)

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
		{ id: 'deleted', value: false },
	])
	const [columnFilterFns, setColumnFilterFns] = //filter modes
		useState<MRT_ColumnFilterFnsState>(
			Object.fromEntries(
				columns.map(({ accessorKey, columnFilterModeOptions }) => [
					accessorKey,
					columnFilterModeOptions?.at(0) ?? 'equals',
				])
			)
		)
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([
		{ id: 'deleted', desc: false },
		{ id: 'published', desc: true },
		{ id: 'name', desc: false },
	])
	const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)

	const getAlertBanner = () => {
		switch (true) {
			case isError: {
				return { color: 'red', children: 'Error fetching data' }
			}
			case isFetching:
			case isLoading: {
				return { color: 'green', children: 'Loading data' }
			}
			default: {
				return { color: 'white', children: null, sx: { backgroundColor: 'transparent' } }
			}
		}
	}

	const table = useMantineReactTable({
		// #region Basic Props
		columns,
		data: data ?? [],
		// #endregion
		// #region Enable features / Table options
		columnFilterDisplayMode: 'popover',
		enableColumnFilterModes: true,
		enableGlobalFilterModes: true,
		enableColumnResizing: false,
		enableFacetedValues: true,
		enablePagination: false,
		enablePinning: true,
		enableRowNumbers: false,
		enableRowVirtualization: true,
		enableExpanding: true,
		enableMultiRowSelection: true,
		enableRowSelection: (row) => !row.getParentRow(),
		enableHiding: true,
		getRowId: (originalRow) => originalRow.id,
		isMultiSortEvent: () => true,
		positionGlobalFilter: 'left',
		rowCount: data?.length ?? 0,
		rowVirtualizerInstanceRef,
		rowVirtualizerProps: { overscan: 5 }, //optionally customize the row virtualizer
		// #endregion
		// #region State
		initialState: {
			columnPinning: { left: ['mrt-row-expand', 'mrt-row-select', 'name'] },
			columnVisibility: {
				published: false,
				deleted: false,
			},
			showColumnFilters: false,
			showGlobalFilter: true,
		},
		state: {
			columnFilterFns,
			columnFilters,
			globalFilter,
			isLoading,
			showAlertBanner: getAlertBanner !== undefined,
			showProgressBars: isFetching,
			sorting,
			density: 'xs',
		},
		// #endregion
		// #region Mantine component props to be passed down
		mantineProgressProps: ({ isTopToolbar }) => ({ style: { display: isTopToolbar ? 'block' : 'none' } }),
		mantineSelectCheckboxProps: ({ row }) => ({ style: { display: row.getCanSelect() ? 'block' : 'none' } }),
		mantineTableContainerProps: { miw: '85%', mah: rem(600) },
		mantineTableBodyCellProps: ({ row }) => ({
			sx: (theme) => ({
				textDecoration: row.original.deleted ? 'line-through' : 'none',
				color: row.original.published ? undefined : theme.other.colors.secondary.darkGray,
			}),
		}),
		mantineToolbarAlertBannerProps: getAlertBanner(),
		mantineTableProps: { striped: true },
		// #endregion
		// #region Override sections
		renderToolbarInternalActions: () => (
			<ToolbarButtons columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
		),
		renderBottomToolbar: ({ table }) => <span>{table.getFilteredRowModel().rows.length} results</span>,
		// #endregion
		// #region Events
		onColumnFilterFnsChange: setColumnFilterFns,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		// #endregion
	})

	return <MantineReactTable table={table} />
}

interface ToolbarButtonsProps {
	columnFilters: MRT_ColumnFiltersState
	setColumnFilters: Dispatch<SetStateAction<MRT_ColumnFiltersState>>
}
