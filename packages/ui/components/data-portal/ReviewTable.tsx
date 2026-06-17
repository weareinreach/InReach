import {
	ActionIcon,
	Badge,
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
	type MRT_Row,
	MRT_ShowHideColumnsButton,
	type MRT_SortingState,
	type MRT_TableInstance,
	MRT_ToggleFiltersButton,
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type ReviewRecord = ApiOutput['review']['forReviewTable'][number]

const useStyles = createStyles(() => ({
	bottomBar: { paddingTop: rem(20) },
}))

const ToolbarButtons = ({ columnFilters, setColumnFilters }: ToolbarButtonsProps) => {
	const theme = useMantineTheme()

	const toggle = (key: 'visible' | 'deleted') => {
		const current = columnFilters.find(({ id }) => key === id)
		const options = key === 'visible' ? [undefined, true, false] : [false, true, undefined]
		const currentIdx = options.indexOf(current?.value as boolean | undefined)
		const nextIdx = (currentIdx + 1) % options.length

		setColumnFilters((prev) =>
			options[nextIdx] === undefined
				? prev.filter(({ id }) => id !== key)
				: [...prev.filter(({ id }) => id !== key), { id: key, value: options[nextIdx] }]
		)
	}

	const visibleState = columnFilters.find(({ id }) => id === 'visible')?.value as boolean | undefined
	const deletedState = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined

	return (
		<Group>
			<Tooltip
				label={
					visibleState
						? 'Show only hidden reviews'
						: visibleState === undefined
							? 'Show only visible reviews'
							: 'Show all reviews'
				}
				withinPortal
			>
				<ActionIcon onClick={() => toggle('visible')}>
					<Icon
						icon={
							visibleState
								? 'carbon:view-filled'
								: visibleState === undefined
									? 'carbon:view'
									: 'carbon:view-off-filled'
						}
						style={{
							color: visibleState === undefined ? theme.other.colors.secondary.darkGray : undefined,
						}}
						height={24}
					/>
				</ActionIcon>
			</Tooltip>
			<Tooltip
				label={
					deletedState
						? 'Show all reviews'
						: deletedState === undefined
							? 'Hide deleted reviews'
							: 'Show deleted reviews'
				}
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

const BottomBar = ({ table }: { table: MRT_TableInstance<ReviewRecord> }) => {
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

export const ReviewTable = () => {
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const { data: session } = useSession()
	const userPerms = session?.user?.permissions || []

	const isManagerOrHigher = userPerms.some((p) =>
		['root', 'sysadmin', 'system', 'dataPortalAdmin', 'dataPortalManager'].includes(p)
	)

	const apiUtils = api.useUtils()

	const hideMutation = api.review.hide.useMutation({
		onSuccess: () => void apiUtils.review.forReviewTable.invalidate(),
	})
	const unHideMutation = api.review.unHide.useMutation({
		onSuccess: () => void apiUtils.review.forReviewTable.invalidate(),
	})
	const deleteMutation = api.review.delete.useMutation({
		onSuccess: () => void apiUtils.review.forReviewTable.invalidate(),
	})
	const unDeleteMutation = api.review.unDelete.useMutation({
		onSuccess: () => void apiUtils.review.forReviewTable.invalidate(),
	})

	const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
		if (currentVisible) {
			await hideMutation.mutateAsync({ id })
		} else {
			await unHideMutation.mutateAsync({ id })
		}
	}

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
		{ id: 'deleted', value: false },
	])
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([{ id: 'createdAt', desc: true }])
	const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})

	const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)

	useEffect(() => {
		try {
			rowVirtualizerInstanceRef.current?.scrollToIndex(0)
		} catch (e) {
			console.error(e)
		}
	}, [sorting])

	const { data, isLoading, isError, isFetching } = api.review.forReviewTable.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})

	const columns = useMemo<MRT_ColumnDef<ReviewRecord>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableColumnFilter: false,
				size: 90,
			},
			{
				id: 'userName',
				header: 'User Name',
				size: 140,
				accessorFn: (row) => row.user?.name || 'Anonymous',
				Cell: ({ cell }) => (
					<Text size='sm' weight={500}>
						{cell.getValue<string>()}
					</Text>
				),
			},
			{
				id: 'userEmail',
				header: 'User Email',
				size: 160,
				accessorFn: (row) => row.user?.email || '',
				Cell: ({ cell }) => <Text size='sm'>{cell.getValue<string>()}</Text>,
			},
			{
				id: 'rating',
				accessorKey: 'rating',
				header: 'Rating',
				size: 100,
				Cell: ({ cell }) => {
					const rating = cell.getValue<number | null>()
					return rating ? (
						<Text size='sm' weight={500}>
							⭐ {rating}/5
						</Text>
					) : (
						<Text size='sm'>No Rating</Text>
					)
				},
				filterVariant: 'select',
			},
			{
				accessorKey: 'reviewText',
				header: 'Review Content',
				size: 300,
				Cell: ({ cell, row }) => {
					const isHiddenOrDeleted = !row.original.visible || row.original.deleted
					return (
						<Text
							size='sm'
							sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
							variant={isHiddenOrDeleted ? variants.Text.utility4darkGray : variants.Text.utility4}
						>
							{cell.getValue<string>() || 'No review text provided.'}
						</Text>
					)
				},
			},
			{
				id: 'organization',
				header: 'Organization',
				size: 200,
				accessorFn: (row) => row.organization?.name || 'Unknown',
				Cell: ({ row }) => {
					const org = row.original.organization
					const location = row.original.orgLocation
					const serviceName = row.original.orgService
						? row.original.orgService.serviceName?.tsKey?.text ||
							row.original.orgService.legacyName ||
							'Service'
						: null

					return (
						<Stack spacing='xs'>
							<Text size='sm' weight={500}>
								{org?.name || 'Unknown Organization'}
							</Text>
							{location && <Text size='xs'>Location: {location.name || 'Unnamed Location'}</Text>}
							{serviceName && <Text size='xs'>Service: {serviceName}</Text>}
						</Stack>
					)
				},
			},
			{
				accessorKey: 'visible',
				header: 'Visible?',
				size: 110,
				Cell: ({ row }) => (
					<Switch
						checked={row.original.visible}
						onChange={() => void handleToggleVisibility(row.original.id, row.original.visible)}
						size='sm'
					/>
				),
				filterVariant: 'checkbox',
			},
			{
				id: 'status',
				header: 'Status',
				size: 120,
				Cell: ({ row }) => {
					const isHidden = !row.original.visible
					const isDeleted = row.original.deleted
					return (
						<Group spacing={4}>
							{isHidden && (
								<Badge color='yellow' variant='filled'>
									Hidden
								</Badge>
							)}
							{isDeleted && (
								<Badge color='red' variant='filled'>
									Deleted
								</Badge>
							)}
							{!isHidden && !isDeleted && (
								<Badge color='green' variant='outline'>
									Active
								</Badge>
							)}
						</Group>
					)
				},
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				size: 150,
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
				accessorKey: 'deleted',
				header: 'Deleted',
				columnFilterModeOptions: ['equals'],
				filterVariant: 'checkbox',
				visibleInShowHideMenu: false,
				size: 0,
			},
		],
		[variants, theme]
	)

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnResizing: true,
		enableFacetedValues: true,
		enablePinning: true,
		enableRowActions: true,
		enableRowVirtualization: true,
		enablePagination: false,
		enableGlobalFilterModes: true,
		positionGlobalFilter: 'left',
		columnFilterDisplayMode: 'popover',

		initialState: {
			columnPinning: { left: ['mrt-row-actions'] },
			columnVisibility: { id: false, visible: false, deleted: false },
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

		mantineSearchTextInputProps: {
			placeholder: 'Search Reviews',
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
			const location = row.original.orgLocation
			const isDeleted = row.original.deleted

			const getViewUrl = (): Route => {
				if (location && org) {
					return {
						pathname: '/org/[slug]/[orgLocationId]',
						query: { slug: org.slug, orgLocationId: location.id },
					}
				} else {
					return { pathname: '/org/[slug]', query: { slug: org?.slug || '' } }
				}
			}

			return (
				<Group noWrap spacing={8}>
					<Tooltip label='View Target' withinPortal>
						<ActionIcon component={Link} href={getViewUrl()} target='_blank'>
							<Icon icon='carbon:search' />
						</ActionIcon>
					</Tooltip>
					{isManagerOrHigher && (
						<Tooltip label={isDeleted ? 'Undelete Review' : 'Delete Review'} withinPortal>
							<ActionIcon
								onClick={() => {
									if (isDeleted) {
										unDeleteMutation.mutate({ id: row.original.id })
									} else {
										deleteMutation.mutate({ id: row.original.id })
									}
								}}
								color={isDeleted ? 'green' : 'red'}
								variant='subtle'
								size='sm'
							>
								<Icon icon={isDeleted ? 'carbon:undo' : 'carbon:trash-can'} />
							</ActionIcon>
						</Tooltip>
					)}
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
