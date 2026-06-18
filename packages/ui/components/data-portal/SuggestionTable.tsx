import {
	ActionIcon,
	createStyles,
	Group,
	rem,
	Stack,
	Switch,
	Text,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_ColumnFilterFnsState,
	type MRT_ColumnFiltersState,
	MRT_ShowHideColumnsButton,
	type MRT_SortingState,
	type MRT_TableInstance,
	MRT_ToggleFiltersButton,
	useMantineReactTable,
} from 'mantine-react-table'
import { type Route } from 'nextjs-routes'
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type SuggestionRecord = ApiOutput['suggestion']['forSuggestionTable'][number]

const useStyles = createStyles(() => ({
	bottomBar: { paddingTop: rem(20) },
}))

const ToolbarButtons = ({ columnFilters, setColumnFilters }: ToolbarButtonsProps) => {
	const toggle = (key: 'handled') => {
		const current = columnFilters.find(({ id }) => key === id)
		const options = [undefined, true, false]
		const currentIdx = options.indexOf(current?.value as boolean | undefined)
		const nextIdx = (currentIdx + 1) % options.length

		setColumnFilters((prev) =>
			options[nextIdx] === undefined
				? prev.filter(({ id }) => id !== key)
				: [...prev.filter(({ id }) => id !== key), { id: key, value: options[nextIdx] }]
		)
	}

	const handledState = columnFilters.find(({ id }) => id === 'handled')?.value as boolean | undefined

	return (
		<Group>
			<Tooltip
				label={
					handledState
						? 'Show only unhandled suggestions'
						: handledState === undefined
							? 'Show only handled suggestions'
							: 'Show all suggestions'
				}
				withinPortal
			>
				<ActionIcon onClick={() => toggle('handled')}>
					<Icon
						icon={
							handledState
								? 'carbon:checkmark-filled'
								: handledState === undefined
									? 'carbon:checkmark'
									: 'carbon:warning'
						}
						height={24}
					/>
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}

const BottomBar = ({ table }: { table: MRT_TableInstance<SuggestionRecord> }) => {
	const { classes } = useStyles()
	const filteredRowCount = table.getFilteredRowModel().rows.length
	const preFilteredRowCount = table.getPreFilteredRowModel().rows.length

	return (
		<div className={classes.bottomBar}>
			<Text variant='utility3'>
				{preFilteredRowCount !== filteredRowCount
					? `Showing ${filteredRowCount} of ${preFilteredRowCount} results`
					: `${preFilteredRowCount} results`}
			</Text>
		</div>
	)
}

export const SuggestionTable = () => {
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()

	const toggleHandledMutation = api.suggestion.toggleHandled.useMutation({
		onSuccess: () => void apiUtils.suggestion.forSuggestionTable.invalidate(),
	})

	const handleToggleHandled = async (id: string, currentHandledStatus: boolean) => {
		await toggleHandledMutation.mutateAsync({ id, handled: !currentHandledStatus })
	}

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([{ id: 'createdAt', desc: true }])
	const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})

	const { data, isLoading, isError, isFetching } = api.suggestion.forSuggestionTable.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})

	const columns = useMemo<MRT_ColumnDef<SuggestionRecord>[]>(
		() => [
			{
				id: 'organization',
				header: 'Organization',
				size: 180,
				accessorFn: (row) => row.organization?.name || 'Unknown',
				Cell: ({ cell }) => (
					<Text size='sm' weight={500} color='inherit'>
						{cell.getValue<string>()}
					</Text>
				),
			},
			{
				id: 'website',
				header: 'Website',
				size: 180,
				accessorKey: 'orgWebsite',
				Cell: ({ cell }) => {
					const url = cell.getValue<string | null>()
					return url ? (
						<Text
							component='a'
							href={url.startsWith('http') ? url : `https://${url}`}
							target='_blank'
							size='sm'
							color='inherit'
							sx={{ textDecoration: 'underline', cursor: 'pointer' }}
						>
							{url}
						</Text>
					) : (
						<Text size='sm' color='dimmed'>
							—
						</Text>
					)
				},
			},
			{
				id: 'attributes',
				header: 'Attributes',
				size: 200,
				accessorKey: 'attributeNames',
				Cell: ({ cell }) => {
					const names = cell.getValue<string[]>() || []
					return (
						<Text size='sm' color='inherit' sx={{ whiteSpace: 'normal' }}>
							{names.length > 0 ? names.join(', ') : 'None'}
						</Text>
					)
				},
			},
			{
				id: 'location',
				header: 'Location',
				size: 220,
				Cell: ({ row }) => {
					const rawAddress = row.original.orgAddress
					const country: string = row.original.countryName || ''

					// 1. Defensively handle whether orgAddress is a string or a nested object
					let address = ''
					if (typeof rawAddress === 'string') {
						address = rawAddress
					} else if (rawAddress && typeof rawAddress === 'object') {
						// Safely pluck and assemble keys matching your error payload
						const { street1, city, govDist, postCode } = rawAddress as Record<string, unknown>
						address = [street1, city, govDist, postCode]
							.filter((val) => typeof val === 'string' && val.trim() !== '')
							.join(', ')
					}

					// 2. Compute lines safely with standard strings
					const line1 = address ? address : country || 'No Location Provided'
					const line2 = address && country ? country : ''

					return (
						<Stack spacing={2}>
							<Text size='sm' color='inherit' sx={{ whiteSpace: 'normal' }}>
								{line1}
							</Text>
							{line2 && (
								<Text size='xs' opacity={0.8} color='inherit' sx={{ whiteSpace: 'normal' }}>
									{line2}
								</Text>
							)}
						</Stack>
					)
				},
			},
			{
				id: 'suggestedBy',
				header: 'Suggested By',
				size: 180,
				Cell: ({ row }) => {
					const user = row.original.suggestedBy
					if (!user)
						return (
							<Text size='sm' color='dimmed'>
								Anonymous
							</Text>
						)

					return (
						<Stack spacing={2}>
							<Text size='sm' weight={500} color='inherit'>
								{user.name}
							</Text>
							<Text size='xs' opacity={0.8} color='inherit'>
								{user.email}
							</Text>
						</Stack>
					)
				},
			},
			{
				accessorKey: 'handled',
				header: 'Handled?',
				size: 110,
				Cell: ({ row }) => (
					<Switch
						// Forces a null or undefined value to evaluate cleanly as false
						checked={row.original.handled ?? false}
						onChange={() => void handleToggleHandled(row.original.id, row.original.handled ?? false)}
						size='sm'
					/>
				),
				filterVariant: 'checkbox',
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				size: 140,
				Cell: ({ cell }) => {
					const date = DateTime.fromJSDate(new Date(cell.getValue<Date>()))
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATETIME_SHORT)} withinPortal>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
				sortingFn: 'datetime',
			},
			{
				accessorKey: 'updatedAt',
				header: 'Updated At',
				size: 140,
				Cell: ({ cell }) => {
					const date = DateTime.fromJSDate(new Date(cell.getValue<Date>()))
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATETIME_SHORT)} withinPortal>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
				sortingFn: 'datetime',
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnResizing: true,
		enableFacetedValues: true,
		enablePinning: true,
		enableRowActions: true,
		positionActionsColumn: 'first',
		enablePagination: false,
		enableGlobalFilterModes: true,
		positionGlobalFilter: 'left',
		columnFilterDisplayMode: 'popover',

		initialState: {
			columnPinning: { left: ['mrt-row-actions'] },
			showGlobalFilter: true,
		},

		state: {
			columnFilters,
			columnFilterFns,
			globalFilter,
			sorting,
			isLoading,
			showAlertBanner: isError || isFetching || isLoading,
			showProgressBars: isFetching,
			density: 'xs',
		},

		mantinePaperProps: { miw: '85%' },
		mantineTableContainerProps: { mah: '60vh' },
		mantineTableProps: { striped: true },

		mantineTableBodyRowProps: ({ row }) => {
			const isHandled = row.original.handled
			return {
				sx: (theme) => ({
					color: isHandled ? `${theme.colors.green[6]} !important` : 'black !important',
				}),
			}
		},

		mantineSearchTextInputProps: {
			placeholder: 'Search Suggestions',
			icon: null,
			sx: (theme) => ({
				width: rem(300),
				'& .mantine-ActionIcon-root': {
					backgroundColor: theme.colors.green[6],
					color: theme.white,
					borderRadius: theme.radius.sm,
					'&:hover': { backgroundColor: theme.colors.green[7] },
				},
			}),
		},

		renderToolbarInternalActions: ({ table }) => (
			<Group spacing='xs'>
				<ToolbarButtons columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
				<MRT_ToggleFiltersButton table={table} />
				<MRT_ShowHideColumnsButton table={table} />
			</Group>
		),
		renderBottomToolbar: ({ table }) => <BottomBar table={table} />,

		renderRowActions: ({ row }) => {
			const org = row.original.organization

			const getViewUrl = (): Route => ({
				pathname: '/org/[slug]',
				query: { slug: org?.slug || '' },
			})

			const getEditUrl = (): Route => ({
				pathname: '/org/[slug]/edit',
				query: { slug: org?.slug || '' },
			})

			return (
				<Group noWrap spacing={8}>
					<Tooltip label='View Organization' withinPortal>
						<ActionIcon component={Link} href={getViewUrl()} target='_blank'>
							<Icon icon='carbon:search' />
						</ActionIcon>
					</Tooltip>
					<Tooltip label='Edit Organization' withinPortal>
						<ActionIcon component={Link} href={getEditUrl()} target='_blank'>
							<Icon icon='carbon:edit' />
						</ActionIcon>
					</Tooltip>
				</Group>
			)
		},

		onColumnFiltersChange: setColumnFilters,
		onColumnFilterFnsChange: setColumnFilterFns,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
	})

	return <MantineReactTable table={table} />
}

interface ToolbarButtonsProps {
	columnFilters: MRT_ColumnFiltersState
	setColumnFilters: Dispatch<SetStateAction<MRT_ColumnFiltersState>>
}
