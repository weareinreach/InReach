import { ActionIcon, Badge, Group, Stack, Switch, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableColumn } from './DataTable'
import { TableToolbarToggle } from './TableToolbarToggle'

type ReviewRecord = ApiOutput['review']['forReviewTable']['results'][number]

export const ReviewTable = () => {
	const variants = useCustomVariant()
	const theme = useMantineTheme()
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

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'deleted', value: false }])
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const visibleFilter = columnFilters.find(({ id }) => id === 'visible')?.value as boolean | undefined
	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const ratingFilter = columnFilters.find(({ id }) => id === 'rating')?.value as string | undefined

	const { data, isLoading, isError, isFetching } = api.review.forReviewTable.useQuery(
		{
			visible: visibleFilter,
			deleted: deletedFilter,
			rating: ratingFilter ? Number(ratingFilter) : undefined,
			search: debouncedGlobalFilter || undefined,
			sorting: sorting.map(({ id, desc }) => ({ id: id as 'createdAt' | 'updatedAt' | 'rating', desc })),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const columns = useMemo<DataTableColumn<ReviewRecord>[]>(
		() => [
			{
				id: 'userName',
				header: 'User Name',
				accessorFn: (row) => row.user?.name || 'Anonymous',
				cell: ({ value }) => (
					<Text size='sm' fw={500}>
						{value as string}
					</Text>
				),
			},
			{
				id: 'userEmail',
				header: 'User Email',
				accessorFn: (row) => row.user?.email || '',
				cell: ({ value }) => <Text size='sm'>{value as string}</Text>,
			},
			{
				id: 'rating',
				header: 'Rating',
				filter: {
					type: 'select',
					options: [1, 2, 3, 4, 5].map((n) => ({
						value: String(n),
						label: `${n} star${n === 1 ? '' : 's'}`,
					})),
				},
				cell: ({ value }) => {
					const rating = value as number | null
					return rating ? (
						<Text size='sm' fw={500}>
							⭐ {rating}/5
						</Text>
					) : (
						<Text size='sm'>No Rating</Text>
					)
				},
			},
			{
				id: 'reviewText',
				header: 'Review Content',
				size: 300,
				cell: ({ value, row }) => {
					const isHiddenOrDeleted = !row.visible || row.deleted
					return (
						<Text
							size='sm'
							style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
							variant={isHiddenOrDeleted ? variants.Text.utility4darkGray : variants.Text.utility4}
						>
							{(value as string) || 'No review text provided.'}
						</Text>
					)
				},
			},
			{
				id: 'organization',
				header: 'Organization',
				size: 200,
				accessorFn: (row) => row.organization?.name || 'Unknown',
				cell: ({ row }) => {
					const org = row.organization
					const location = row.orgLocation
					const serviceName = row.orgService
						? row.orgService.serviceName?.tsKey?.text || row.orgService.legacyName || 'Service'
						: null

					return (
						<Stack gap='xs'>
							<Text size='sm' fw={500}>
								{org?.name || 'Unknown Organization'}
							</Text>
							{location && <Text size='xs'>Location: {location.name || 'Unnamed Location'}</Text>}
							{serviceName && <Text size='xs'>Service: {serviceName}</Text>}
						</Stack>
					)
				},
			},
			{
				id: 'visible',
				header: 'Visible?',
				hiddenByDefault: true,
				cell: ({ row }) => (
					<Switch
						checked={row.visible}
						onChange={() => void handleToggleVisibility(row.id, row.visible)}
						size='sm'
					/>
				),
			},
			{
				id: 'status',
				header: 'Status',
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: ({ row }) => {
					const isHidden = !row.visible
					const isDeleted = row.deleted
					return (
						<Group gap={4}>
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
				id: 'createdAt',
				header: 'Created At',
				cell: ({ value }) => {
					const date = DateTime.fromJSDate(value as Date)
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATETIME_SHORT)}>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
			},
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 90,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: ({ row }) => {
					const org = row.organization
					const location = row.orgLocation
					const isDeleted = row.deleted

					const getViewUrl = (): Route =>
						location && org
							? {
									pathname: '/org/[slug]/[orgLocationId]',
									query: { slug: org.slug, orgLocationId: location.id },
								}
							: { pathname: '/org/[slug]', query: { slug: org?.slug || '' } }

					return (
						<Group wrap='nowrap' gap={8}>
							<Tooltip label='View Target'>
								<ActionIcon component={Link} href={getViewUrl()} target='_blank'>
									<Icon icon='carbon:search' />
								</ActionIcon>
							</Tooltip>
							{isManagerOrHigher && (
								<Tooltip label={isDeleted ? 'Undelete Review' : 'Delete Review'}>
									<ActionIcon
										onClick={() => {
											if (isDeleted) {
												unDeleteMutation.mutate({ id: row.id })
											} else {
												deleteMutation.mutate({ id: row.id })
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
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[variants, theme, isManagerOrHigher]
	)

	return (
		<DataTable
			data={data?.results ?? []}
			columns={columns}
			columnFilters={columnFilters}
			onColumnFiltersChange={setColumnFilters}
			sorting={sorting}
			onSortingChange={setSorting}
			globalFilter={globalFilter}
			onGlobalFilterChange={setGlobalFilter}
			globalFilterPlaceholder='Search Reviews'
			pagination={pagination}
			onPaginationChange={setPagination}
			mode={{ serverSide: true, rowCount: data?.total ?? 0 }}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
			toolbarExtra={
				<>
					<TableToolbarToggle
						columnId='visible'
						columnFilters={columnFilters}
						setColumnFilters={setColumnFilters}
						cycle={[undefined, true, false]}
						label={(state) =>
							state
								? 'Show only hidden reviews'
								: state === undefined
									? 'Show only visible reviews'
									: 'Show all reviews'
						}
						icon={(state) =>
							state ? 'carbon:view-filled' : state === undefined ? 'carbon:view' : 'carbon:view-off-filled'
						}
					/>
					<TableToolbarToggle
						columnId='deleted'
						columnFilters={columnFilters}
						setColumnFilters={setColumnFilters}
						cycle={[false, true, undefined]}
						label={(state) =>
							state
								? 'Show all reviews'
								: state === undefined
									? 'Hide deleted reviews'
									: 'Show deleted reviews'
						}
						icon={() => 'carbon:trash-can'}
					/>
				</>
			}
		/>
	)
}
