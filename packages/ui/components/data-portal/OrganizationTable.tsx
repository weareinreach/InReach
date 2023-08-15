import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFilterFnsState,
	type MRT_ColumnFiltersState,
	type MRT_SortingState,
	useMantineReactTable,
} from 'mantine-react-table'
import { useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

type Fields = ApiOutput['organization']['forOrganizationTable'][number]

export const OrganizationTable = (props: Props) => {
	const columns = useMemo<MRT_ColumnDef<Fields>[]>(
		() => [
			{ accessorKey: 'name', header: 'Name' },
			{ accessorKey: 'lastVerified', header: 'Last Verified' },
			{ accessorKey: 'updatedAt', header: 'Last Updated' },
			{ accessorKey: 'createdAt', header: 'Created' },
			{ accessorKey: 'published', header: 'Published' },
			{ accessorKey: 'deleted', header: 'Deleted' },
		],
		[]
	)

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
	const [columnFilterFns, setColumnFilterFns] = //filter modes
		useState<MRT_ColumnFilterFnsState>(
			Object.fromEntries(columns.map(({ accessorKey }) => [accessorKey, 'contains']))
		)
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([])

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(undefined, {
		placeholderData: [],
	})

	const getAlertBanner = useMemo(() => {
		switch (true) {
			case isError: {
				return {
					color: 'red',
					children: 'Error fetching data',
				}
			}
			case isLoading: {
				return {
					color: 'green',
					children: 'Loading data',
				}
			}
			default: {
				return undefined
			}
		}
	}, [isLoading, isError])

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnFilterModes: true,
		columnFilterModeOptions: ['contains', 'startsWith', 'endsWith'],
		initialState: {
			showColumnFilters: true,
		},
		manualFiltering: true,
		manualSorting: true,
		mantineToolbarAlertBannerProps: getAlertBanner,
		onColumnFilterFnsChange: setColumnFilterFns,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		rowCount: data?.length ?? 0,
		state: {
			columnFilterFns,
			columnFilters,
			globalFilter,
			isLoading,
			showAlertBanner: getAlertBanner !== undefined,
			showProgressBars: isFetching,
			sorting,
		},
	})

	return <MantineReactTable table={table} />
}

interface Props {}
