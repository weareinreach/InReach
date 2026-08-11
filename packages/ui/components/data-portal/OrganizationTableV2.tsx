import { ActionIcon, createStyles, Group, rem, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFiltersState,
	type MRT_PaginationState,
	type MRT_Row,
	MRT_ShowHideColumnsButton,
	type MRT_SortingState,
	MRT_ToggleFiltersButton,
	useMantineReactTable,
} from 'mantine-react-table'
import { type Route } from 'nextjs-routes'
import { useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	warning: {
		color: theme.other.colors.tertiary.red,
	},
	warningDim: {
		color: theme.fn.lighten(theme.other.colors.tertiary.red, 0.3),
	},
	bottomBar: {
		paddingTop: rem(20),
	},
}))

const getAlertBanner = ({
	isError,
	isFetching,
	isLoading,
}: Record<'isError' | 'isFetching' | 'isLoading', boolean>) => {
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

interface ToolbarButtonsProps {
	columnFilters: MRT_ColumnFiltersState
	setColumnFilters: (updater: MRT_ColumnFiltersState) => void
}
const ToolbarButtons = ({ columnFilters, setColumnFilters }: ToolbarButtonsProps) => {
	const theme = useMantineTheme()
	const toggle = (key: 'published' | 'deleted') => {
		const current = columnFilters.find(({ id }) => key === id)
		const options = key === 'published' ? [undefined, true, false] : [false, true, undefined]
		const currentIdx = options.indexOf(current?.value as boolean | undefined)
		const nextIdx = (currentIdx + 1) % options.length
		const next = options[nextIdx]
		setColumnFilters(
			next === undefined
				? columnFilters.filter(({ id }) => id !== key)
				: [...columnFilters.filter(({ id }) => id !== key), { id: key, value: next }]
		)
	}
	const publishedState = columnFilters.find(({ id }) => id === 'published')?.value as boolean | undefined
	const deletedState = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined

	return (
		<Group>
			<Tooltip
				label={
					publishedState
						? 'Show only unpublished'
						: publishedState === undefined
							? 'Show only published'
							: 'Show all'
				}
				withinPortal
			>
				<ActionIcon onClick={() => toggle('published')}>
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
					/>
				</ActionIcon>
			</Tooltip>
			<Tooltip
				label={deletedState ? 'Show all' : deletedState === undefined ? 'Hide deleted' : 'Show deleted'}
				withinPortal
			>
				<ActionIcon onClick={() => toggle('deleted')}>
					<Group noWrap ml={8}>
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
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}

interface BottomBarProps {
	total: number
	rowCount: number
}
const BottomBar = ({ total, rowCount }: BottomBarProps) => {
	const { classes } = useStyles()
	return (
		<div className={classes.bottomBar}>
			<Text variant='utility3'>
				Showing {rowCount} of {total} results
			</Text>
		</div>
	)
}

interface RowActionProps {
	row: MRT_Row<RowItem>
}
const RowAction = ({ row }: RowActionProps) => {
	const getViewUrl = (): Route => {
		const parent = row.getParentRow()
		if (parent) {
			return {
				pathname: '/org/[slug]/[orgLocationId]',
				query: { slug: parent.original.slug, orgLocationId: row.original.id },
			}
		}
		return { pathname: '/org/[slug]', query: { slug: row.original.slug } }
	}
	const getEditUrl = (): Route => {
		const parent = row.getParentRow()
		if (parent) {
			return {
				pathname: '/org/[slug]/[orgLocationId]/edit',
				query: { slug: parent.original.slug, orgLocationId: row.original.id },
			}
		}
		return { pathname: '/org/[slug]/edit', query: { slug: row.original.slug } }
	}
	return (
		<Group noWrap spacing={8}>
			<Tooltip label='View' withinPortal>
				<ActionIcon component={Link} href={getViewUrl()} target='_blank'>
					<Icon icon='carbon:search' />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit' withinPortal>
				<ActionIcon component={Link} href={getEditUrl()} target='_blank'>
					<Icon icon='carbon:edit' />
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}

type RowItem = Omit<ApiOutput['organization']['forOrganizationTableV2']['results'][number], 'locations'> & {
	subRows: ApiOutput['organization']['forOrganizationTableV2']['results'][number]['locations']
}

/**
 * V2 of the Organizations tab, built for direct comparison against the V1 OrganizationTable: filtering,
 * sorting, and pagination all happen server-side (forOrganizationTableV2) instead of over a fully-loaded
 * client-side dataset. See docs/DataPortal/OrganizationsV2/README.md.
 */
export const OrganizationTableV2 = () => {
	const { classes } = useStyles()
	const variants = useCustomVariant()

	// Matches V1's default filter exactly (deleted hidden, published unset/"show all") so the only variable
	// being compared between the two tabs is client-side vs. server-side search/sort/filter, not a different
	// starting result set.
	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
		{ id: 'deleted', value: false },
	])
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<MRT_SortingState>([{ id: 'name', desc: false }])
	const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 50 })

	const publishedFilter = columnFilters.find(({ id }) => id === 'published')?.value as boolean | undefined
	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTableV2.useQuery(
		{
			published: publishedFilter,
			deleted: deletedFilter,
			search: debouncedGlobalFilter || undefined,
			lastVerified: dateFilter('lastVerified')
				? { from: dateFilter('lastVerified')?.[0], to: dateFilter('lastVerified')?.[1] }
				: undefined,
			updatedAt: dateFilter('updatedAt')
				? { from: dateFilter('updatedAt')?.[0], to: dateFilter('updatedAt')?.[1] }
				: undefined,
			createdAt: dateFilter('createdAt')
				? { from: dateFilter('createdAt')?.[0], to: dateFilter('createdAt')?.[1] }
				: undefined,
			sorting: sorting.map(({ id, desc }) => ({
				id: id as 'name' | 'lastVerified' | 'updatedAt' | 'createdAt',
				desc,
			})),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{
			select: (data) => ({
				...data,
				results: data.results.map(({ locations, ...rest }) => ({ ...rest, subRows: locations })),
			}),
			keepPreviousData: true,
			refetchOnWindowFocus: false,
		}
	)

	const columns = useMemo<MRT_ColumnDef<RowItem>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableColumnFilter: false,
				enableSorting: false,
				size: 220,
			},
			{
				accessorKey: 'name',
				header: 'Name',
				enableColumnFilter: false,
				enableResizing: true,
				minSize: 250,
				Cell: ({ cell, row }) => {
					const isSubRow = row.parentId !== undefined
					const isPublished = row.original.published
					const isExpanded = row.getIsExpanded()
					const getTextVariant = () => {
						switch (true) {
							case !isPublished && isExpanded: {
								return variants.Text.utility3darkGray
							}
							case !isPublished: {
								return variants.Text.utility4darkGray
							}
							case isExpanded: {
								return variants.Text.utility3
							}
							default: {
								return variants.Text.utility4
							}
						}
					}
					return (
						<Group spacing={8} pl={isSubRow ? 16 : 0}>
							<Text variant={getTextVariant()}>{cell.getValue<string>()}</Text>
							{!isPublished && <Icon icon='carbon:view-off' />}
						</Group>
					)
				},
			},
			{
				accessorKey: 'lastVerified',
				header: 'Verified',
				Cell: ({ cell, row }) => {
					if (row.getParentRow()) return null
					if (!cell.getValue<Date>())
						return (
							<Group spacing={4}>
								<Icon
									icon='carbon:warning-filled'
									className={row.original.published ? classes.warning : classes.warningDim}
								/>
								<span className={row.original.published ? classes.warning : classes.warningDim}>Never</span>
							</Group>
						)
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATE_HUGE)} withinPortal>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
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
				filterVariant: 'date-range',
				enableColumnFilterModes: false,
				size: 150,
			},
			{
				accessorKey: 'published',
				header: 'Published',
				Cell: ({ cell }) => cell.getValue<boolean>().toString(),
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
				filterVariant: 'checkbox',
				enableColumnFilterModes: false,
				mantineFilterCheckboxProps: { label: 'Deleted?' },
				enableSorting: false,
				enableColumnActions: false,
				size: 100,
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)

	const results = data?.results ?? []
	const total = data?.total ?? 0

	const table = useMantineReactTable({
		columns,
		data: results,

		enableColumnResizing: true,
		enablePinning: true,
		enableRowActions: true,
		enableRowNumbers: false,
		enableExpanding: true,
		enableMultiRowSelection: false,
		enableRowSelection: false,
		enableHiding: true,
		positionGlobalFilter: 'left',
		rowCount: total,

		// Server drives filtering/sorting/pagination — MRT just renders whatever comes back.
		manualFiltering: true,
		manualSorting: true,
		manualPagination: true,
		enableFacetedValues: false,

		columnFilterDisplayMode: 'popover',
		enableColumnFilterModes: false,
		enableGlobalFilterModes: false,

		initialState: {
			columnPinning: { left: ['mrt-row-expand', 'mrt-row-actions', 'name'] },
			columnVisibility: { id: false, published: false, deleted: false },
			showColumnFilters: false,
			showGlobalFilter: true,
		},
		state: {
			columnFilters,
			globalFilter,
			isLoading,
			pagination,
			showAlertBanner: isError || isFetching || isLoading,
			showProgressBars: isFetching,
			sorting,
			density: 'xs',
		},

		mantinePaperProps: { miw: '85%' },
		mantineProgressProps: ({ isTopToolbar }) => ({ style: { display: isTopToolbar ? 'block' : 'none' } }),
		mantineTableContainerProps: { mah: '60vh' },
		mantineTableBodyCellProps: ({ row }) => ({
			sx: (theme) => ({
				textDecoration: row.original.deleted ? 'line-through' : 'none',
				color: row.original.published ? undefined : theme.other.colors.secondary.darkGray,
			}),
		}),
		mantineToolbarAlertBannerProps: getAlertBanner({ isLoading, isFetching, isError }),
		mantineTableProps: { striped: true },

		renderToolbarInternalActions: ({ table }) => (
			<Group spacing='xs'>
				<ToolbarButtons columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
				<MRT_ToggleFiltersButton table={table} />
				<MRT_ShowHideColumnsButton table={table} />
			</Group>
		),
		renderBottomToolbar: () => <BottomBar total={total} rowCount={results.length} />,
		renderRowActions: ({ row }) => <RowAction row={row} />,

		onColumnFiltersChange: (updater) =>
			setColumnFilters((prev) => (typeof updater === 'function' ? updater(prev) : updater)),
		onGlobalFilterChange: (updater) =>
			setGlobalFilter((prev) => (typeof updater === 'function' ? updater(prev) : (updater ?? ''))),
		onSortingChange: (updater) =>
			setSorting((prev) => (typeof updater === 'function' ? updater(prev) : updater)),
		onPaginationChange: (updater) =>
			setPagination((prev) => (typeof updater === 'function' ? updater(prev) : updater)),
	})

	return <MantineReactTable table={table} />
}
