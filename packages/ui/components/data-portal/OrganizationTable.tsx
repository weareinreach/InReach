import { ActionIcon, createStyles, Group, rem, Text, Tooltip, useMantineTheme } from '@mantine/core'
// import { ReactTableDevtools } from '@tanstack/react-table-devtools'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFilterFnsState,
	type MRT_ColumnFiltersState,
	type MRT_Row,
	type MRT_SortingState,
	type MRT_TableInstance,
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { type Route } from 'nextjs-routes'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { CsvDownload } from '~ui/components/core/ActionButtons/CsvDownload'
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
	devTool: {
		'& *': {
			backgroundColor: '#132337',
		},
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
		<Group>
			<Group noWrap spacing={8}>
				<CsvDownload
					label='All Published Organizations'
					fileName='all_published_organizations'
					useMutationHook={() => api.organization.getAllPublishedForCSV.useMutation()}
					permissionKey='dataPortalManager'
				/>
				<CsvDownload
					label='All Unpublished Organizations'
					fileName='all_unpublished_organizations'
					useMutationHook={() => api.organization.getAllUnpublishedForCSV.useMutation()}
					permissionKey='dataPortalManager'
				/>
			</Group>
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

const BottomBar = ({ table }: BottomBarProps) => {
	const { classes } = useStyles()
	const filteredRowCount = table.getFilteredRowModel().rows.length
	const preFilteredRowCount = table.getPreFilteredRowModel().rows.length

	if (preFilteredRowCount !== filteredRowCount) {
		return (
			<div className={classes.bottomBar}>
				<Text variant='utility3'>
					Showing {filteredRowCount} of {preFilteredRowCount} results
				</Text>
			</div>
		)
	}

	return (
		<div className={classes.bottomBar}>
			<Text variant='utility3'>{preFilteredRowCount} results</Text>
		</div>
	)
}

const RowAction = ({ row }: RowActionProps) => {
	const getViewUrl = (): Route => {
		const parent = row.getParentRow()
		if (parent) {
			return {
				pathname: '/org/[slug]/[orgLocationId]',
				query: { slug: parent.original.slug, orgLocationId: row.original.id },
			}
		} else {
			return { pathname: '/org/[slug]', query: { slug: row.original.slug } }
		}
	}
	const getEditUrl = (): Route => {
		const parent = row.getParentRow()
		if (parent) {
			return {
				pathname: '/org/[slug]/[orgLocationId]/edit',
				query: { slug: parent.original.slug, orgLocationId: row.original.id },
			}
		} else {
			return { pathname: '/org/[slug]/edit', query: { slug: row.original.slug } }
		}
	}
	return (
		<Group noWrap spacing={8}>
			<Tooltip label='View' withinPortal>
				<ActionIcon
					component={Link}
					href={getViewUrl()}
					// @ts-expect-error ignore the blank target error
					target='_blank'
				>
					<Icon icon='carbon:search' />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit' withinPortal>
				<ActionIcon
					component={Link}
					href={getEditUrl()}
					// @ts-expect-error ignore the blank target error
					target='_blank'
				>
					<Icon icon='carbon:edit' />
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}

export const OrganizationTable = () => {
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(undefined, {
		select: (data) => data.map(({ locations, ...rest }) => ({ ...rest, subRows: locations })),
		refetchOnWindowFocus: false,
	})

	// #region Column Definitions
	const columns = useMemo<MRT_ColumnDef<RestucturedDataItem>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				columnFilterModeOptions: ['contains', 'fuzzy', 'startsWith', 'endsWith'],
				filterVariant: 'autocomplete',
				enableResizing: true,
				minSize: 250,
				enableColumnFilter: false,
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
					const textVariant = getTextVariant()

					return (
						<Group spacing={8} pl={isSubRow ? 16 : 0}>
							<Text variant={textVariant}>{cell.getValue<string>()}</Text>
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
				columnFilterModeOptions: ['betweenInclusive'],
				filterVariant: 'date-range',
				enableColumnFilterModes: false,
				size: 150,
				sortingFn: 'datetime',
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)
	// #endregion

	// #region State
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
		// { id: 'name', desc: false },
	])
	const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)
	useEffect(() => {
		try {
			//scroll to the top of the table when the sorting changes
			rowVirtualizerInstanceRef.current?.scrollToIndex(0)
		} catch (e) {
			console.error(e)
		}
	}, [sorting])
	// #endregion

	// #region Table Setup
	const table = useMantineReactTable({
		// #region Basic Props
		columns,
		data: data ?? [],
		// #endregion
		// #region Enable features / Table options

		enableColumnResizing: false,
		enableFacetedValues: true,
		enablePinning: true,
		enableRowActions: true,
		enableRowNumbers: false,
		enableExpanding: true,
		// enableMultiRowSelection: true,
		// enableRowSelection: (row) => !row.getParentRow(),
		enableMultiRowSelection: false,
		enableRowSelection: false,
		enableHiding: true,
		// getRowId: (originalRow) => originalRow.id,
		positionGlobalFilter: 'left',
		rowCount: data?.length ?? 0,
		// #endregion
		// #region Filtering/Sorting
		columnFilterDisplayMode: 'popover',
		enableColumnFilterModes: true,
		enableGlobalFilterModes: true,
		isMultiSortEvent: () => true,
		maxLeafRowFilterDepth: 0,
		// #endregion

		// #region Virtualization
		enablePagination: false,
		enableRowVirtualization: true,
		rowVirtualizerInstanceRef,
		rowVirtualizerProps: { overscan: 10, estimateSize: () => 45 },
		// #endregion

		// #region State
		initialState: {
			columnPinning: { left: ['mrt-row-expand', 'mrt-row-select', 'mrt-row-actions', 'name'] },
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
			showAlertBanner: isError || isFetching || isLoading,
			showProgressBars: isFetching,
			sorting,
			density: 'xs',
		},
		// #endregion
		// #region Mantine component props to be passed down
		mantinePaperProps: { miw: '85%' },
		mantineProgressProps: ({ isTopToolbar }) => ({ style: { display: isTopToolbar ? 'block' : 'none' } }),
		mantineSelectCheckboxProps: ({ row }) => ({ style: { display: row.getCanSelect() ? 'block' : 'none' } }),
		mantineTableContainerProps: { mah: '60vh' },
		mantineTableBodyCellProps: ({ row }) => ({
			sx: (theme) => ({
				textDecoration: row.original.deleted ? 'line-through' : 'none',
				color: row.original.published ? undefined : theme.other.colors.secondary.darkGray,
			}),
		}),
		mantineToolbarAlertBannerProps: getAlertBanner({ isLoading, isFetching, isError }),
		mantineTableProps: { striped: true },
		// #endregion
		// #region Override sections
		renderToolbarInternalActions: () => (
			<ToolbarButtons columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
		),
		renderBottomToolbar: ({ table }) => <BottomBar table={table} />,
		renderRowActions: ({ row }) => <RowAction row={row} />,
		// #endregion
		// #region Events
		onColumnFilterFnsChange: setColumnFilterFns,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		// #endregion
	})
	// #endregion

	return (
		<>
			<MantineReactTable table={table} />
			{/* <ReactTableDevtools table={table} panelProps={{ className: classes.devTool }} containerElement='div' /> */}
		</>
	)
}

interface ToolbarButtonsProps {
	columnFilters: MRT_ColumnFiltersState
	setColumnFilters: Dispatch<SetStateAction<MRT_ColumnFiltersState>>
}
interface BottomBarProps {
	table: MRT_TableInstance<RestucturedDataItem>
}
interface RowActionProps {
	row: MRT_Row<RestucturedDataItem>
}
type RestucturedDataItem = Omit<ApiOutput['organization']['forOrganizationTable'][number], 'locations'> & {
	subRows: ApiOutput['organization']['forOrganizationTable'][number]['locations']
}
