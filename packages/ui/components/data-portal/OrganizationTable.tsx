import { Tooltip } from '@mantine/core'
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
import { useEffect, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

type Fields = ApiOutput['organization']['forOrganizationTable'][number]

export const OrganizationTable = (props: Props) => {
	const columns = useMemo<MRT_ColumnDef<Fields>[]>(
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
	// useEffect(() => {
	// 	//scroll to the top of the table when the sorting changes
	// 	rowVirtualizerInstanceRef.current?.scrollToIndex(0)
	// }, [sorting])

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(undefined, {
		placeholderData: [],
	})

	const getAlertBanner = () => {
		switch (true) {
			case isError: {
				return {
					color: 'red',
					children: 'Error fetching data',
				}
			}
			case isFetching:
			case isLoading: {
				return {
					color: 'green',
					children: 'Loading data',
				}
			}
			default: {
				return { color: 'white', children: null, sx: { backgroundColor: 'transparent' } }
			}
		}
	}

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnFilterModes: true,
		enableGlobalFilterModes: true,
		enableColumnResizing: false,
		enableFacetedValues: true,
		enablePagination: false,
		enablePinning: true,
		enableRowNumbers: false,
		enableRowVirtualization: true,
		mantineTableContainerProps: { sx: { maxHeight: '600px' } },
		columnFilterDisplayMode: 'popover',

		// columnFilterModeOptions: ['contains', 'startsWith', 'endsWith'],
		initialState: {
			showColumnFilters: false,
			columnPinning: { left: ['name'] },
		},
		mantineToolbarAlertBannerProps: getAlertBanner(),
		onColumnFilterFnsChange: setColumnFilterFns,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		rowCount: data?.length ?? 0,
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
		rowVirtualizerInstanceRef,
		rowVirtualizerProps: { overscan: 5 }, //optionally customize the row virtualizer
		mantineTableProps: { striped: true },
		mantineProgressProps: ({ isTopToolbar }) => ({ style: { display: isTopToolbar ? 'block' : 'none' } }),
		renderBottomToolbar: ({ table }) => <span>{table.getFilteredRowModel().rows.length} results</span>,
		isMultiSortEvent: () => true,
	})

	return <MantineReactTable table={table} />
}

interface Props {}
