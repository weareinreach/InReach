import { ActionIcon, Badge, createStyles, Group, rem, Switch, Text, Tooltip } from '@mantine/core'
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
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type ReviewRecord = ApiOutput['review']['forReviewTable'][number]

const useStyles = createStyles(() => ({
	bottomBar: { paddingTop: rem(20) },
}))

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
	const variants = useCustomVariant()
	const { data: session } = useSession()
	const userPerms = session?.user?.permissions || []

	const isManagerOrHigher = userPerms.some((p) =>
		['root', 'sysadmin', 'system', 'dataPortalAdmin', 'dataPortalManager'].includes(p)
	)

	const apiUtils = api.useUtils()

	// Mutations for visibility
	const hideMutation = api.review.hide.useMutation({
		onSuccess: () => {
			void apiUtils.review.forReviewTable.invalidate()
		},
	})
	const unHideMutation = api.review.unHide.useMutation({
		onSuccess: () => {
			void apiUtils.review.forReviewTable.invalidate()
		},
	})

	// Mutations for deletion
	const deleteMutation = api.review.delete.useMutation({
		onSuccess: () => {
			void apiUtils.review.forReviewTable.invalidate()
		},
	})
	const unDeleteMutation = api.review.unDelete.useMutation({
		onSuccess: () => {
			void apiUtils.review.forReviewTable.invalidate()
		},
	})

	const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
		if (currentVisible) {
			await hideMutation.mutateAsync({ id })
		} else {
			await unHideMutation.mutateAsync({ id })
		}
	}

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
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
				Cell: ({ cell }) => (
					<Text size='sm' color='dimmed'>
						{cell.getValue<string>()}
					</Text>
				),
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
						<Text size='sm' color='dimmed'>
							No Rating
						</Text>
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
				header: 'Target Details',
				size: 200,
				accessorFn: (row) => row.organization?.name || 'Unknown',
				Cell: ({ row }) => {
					const org = row.original.organization
					const service = row.original.orgService
					const serviceName = service?.serviceName?.tsKey?.text || 'Service'
					return (
						<div>
							{org ? (
								<Link
									href={{
										pathname: '/org/[slug]',
										query: { slug: org.slug },
									}}
									target='_blank'
								>
									<Text size='sm' weight={500} color='green'>
										{org.name}
									</Text>
								</Link>
							) : (
								<Text size='sm' color='dimmed' italic>
									Unknown Organization
								</Text>
							)}
							{service && (
								<Text size='xs' color='dimmed'>
									Service: {serviceName}
								</Text>
							)}
						</div>
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
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[variants]
	)

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnResizing: true,
		enableFacetedValues: true,
		enablePinning: true,
		enableRowActions: isManagerOrHigher,
		enableRowVirtualization: true,
		enablePagination: false,
		enableGlobalFilterModes: true,
		positionGlobalFilter: 'left',
		columnFilterDisplayMode: 'popover',

		initialState: {
			columnPinning: { left: ['mrt-row-actions'] },
			columnVisibility: { id: false },
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
				<MRT_ToggleFiltersButton table={table} />
				<MRT_ShowHideColumnsButton table={table} />
			</Group>
		),
		renderBottomToolbar: ({ table }) => <BottomBar table={table} />,
		renderRowActions: ({ row }) => {
			const isDeleted = row.original.deleted
			return (
				<Group noWrap spacing={8}>
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
