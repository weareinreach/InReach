import {
	ActionIcon,
	Badge,
	Group,
	type MantineTheme,
	Switch,
	Text,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { useCallback, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'
import { TableToolbarToggle } from './TableToolbarToggle'

type ReviewRecord = ApiOutput['review']['forReviewTable']['results'][number]
type ReviewSortColumn = 'createdAt' | 'rating' | 'reviewText' | 'userName' | 'userEmail' | 'organization'

const getReviewTargetUrl = (row: ReviewRecord): Route => {
	const org = row.organization
	const location = row.orgLocation
	return location && org
		? {
				pathname: '/org/[slug]/[orgLocationId]',
				query: { slug: org.slug, orgLocationId: location.id },
			}
		: { pathname: '/org/[slug]', query: { slug: org?.slug || '' } }
}

interface ActionsCellProps {
	row: ReviewRecord
	theme: MantineTheme
	isManagerOrHigher: boolean
	onDelete: (vars: { id: string }) => void
	onUndelete: (vars: { id: string }) => void
}

const createActionsCell = (extra: Omit<ActionsCellProps, 'row'>) => {
	const ActionsCellWithExtras = ({ row }: DataTableCellContext<ReviewRecord>) => (
		<ActionsCell row={row} {...extra} />
	)
	return ActionsCellWithExtras
}

const ActionsCell = ({ row, theme, isManagerOrHigher, onDelete, onUndelete }: ActionsCellProps) => {
	const isDeleted = row.deleted

	return (
		<Group wrap='nowrap' gap={8}>
			<Tooltip label='View Target'>
				<ActionIcon variant='subtle' component={Link} href={getReviewTargetUrl(row)} target='_blank'>
					<Icon icon='carbon:search' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			{isManagerOrHigher && (
				<Tooltip label={isDeleted ? 'Undelete Review' : 'Delete Review'}>
					<ActionIcon
						onClick={() => {
							if (isDeleted) {
								onUndelete({ id: row.id })
							} else {
								onDelete({ id: row.id })
							}
						}}
						variant='subtle'
						size='sm'
					>
						<Icon
							icon={isDeleted ? 'carbon:undo' : 'carbon:trash-can'}
							color={isDeleted ? theme.other.colors.primary.allyGreen : theme.other.colors.tertiary.red}
						/>
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	)
}

const IdCell = ({ row }: { row: ReviewRecord }) => (
	<Text size='xs' ff='monospace'>
		{row.id}
	</Text>
)

const UserNameCell = ({ value }: { value: unknown }) => (
	<Text size='sm' fw={500} style={{ whiteSpace: 'nowrap' }}>
		{value as string}
	</Text>
)

const UserEmailCell = ({ value }: { value: unknown }) => (
	<Text size='sm' style={{ whiteSpace: 'nowrap' }}>
		{value as string}
	</Text>
)

const RatingCell = ({ value }: { value: unknown }) => {
	const rating = value as number | null
	return rating ? (
		<Text size='sm' fw={500}>
			⭐ {rating}/5
		</Text>
	) : (
		<Text size='sm'>No Rating</Text>
	)
}

interface ReviewTextCellProps {
	row: ReviewRecord
	value: unknown
	variants: ReturnType<typeof useCustomVariant>
}

const createReviewTextCell = (variants: ReturnType<typeof useCustomVariant>) => {
	const ReviewTextCellWithVariants = ({ row, value }: DataTableCellContext<ReviewRecord>) => (
		<ReviewTextCell row={row} value={value} variants={variants} />
	)
	return ReviewTextCellWithVariants
}

const ReviewTextCell = ({ row, value, variants }: ReviewTextCellProps) => {
	const isHiddenOrDeleted = !row.visible || row.deleted
	return (
		<Text
			size='sm'
			lineClamp={2}
			variant={isHiddenOrDeleted ? variants.Text.utility4darkGray : variants.Text.utility4}
		>
			{(value as string) || 'No review text provided.'}
		</Text>
	)
}

interface VisibleCellProps {
	row: ReviewRecord
	onToggle: (id: string, currentVisible: boolean) => void
}

const createVisibleCell = (onToggle: VisibleCellProps['onToggle']) => {
	const VisibleCellWithToggle = ({ row }: DataTableCellContext<ReviewRecord>) => (
		<VisibleCell row={row} onToggle={onToggle} />
	)
	return VisibleCellWithToggle
}

const VisibleCell = ({ row, onToggle }: VisibleCellProps) => {
	const handleChange = useCallback(() => {
		onToggle(row.id, row.visible)
	}, [onToggle, row.id, row.visible])

	return <Switch checked={row.visible} onChange={handleChange} size='sm' />
}

const OrganizationCell = ({ row }: { row: ReviewRecord }) => {
	const org = row.organization
	const location = row.orgLocation
	const serviceName = row.orgService
		? row.orgService.serviceName?.tsKey?.text || row.orgService.legacyName || 'Service'
		: null
	const detail = [
		location ? `Location: ${location.name || 'Unnamed Location'}` : null,
		serviceName ? `Service: ${serviceName}` : null,
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<Tooltip label={detail} disabled={!detail}>
			<Text size='sm' fw={500} lineClamp={1}>
				{org?.name || 'Unknown Organization'}
			</Text>
		</Tooltip>
	)
}

const StatusCell = ({ row }: { row: ReviewRecord }) => {
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
}

const CreatedAtCell = ({ value }: { value: unknown }) => {
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

const getVisibleFilterLabel = (state: boolean | undefined) => {
	if (state) {
		return 'Show only hidden reviews'
	}
	if (state === undefined) {
		return 'Show only visible reviews'
	}
	return 'Show all reviews'
}

const getVisibleFilterIcon = (state: boolean | undefined) => {
	if (state) {
		return 'carbon:view-filled'
	}
	if (state === undefined) {
		return 'carbon:view'
	}
	return 'carbon:view-off-filled'
}

const getDeletedFilterLabel = (state: boolean | undefined) => {
	if (state) {
		return 'Show all reviews'
	}
	if (state === undefined) {
		return 'Hide deleted reviews'
	}
	return 'Show deleted reviews'
}

const getDeletedFilterIcon = () => 'carbon:trash-can'

const isDeletedFilterSlashed = (state: boolean | undefined) => state === false

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
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isError, isFetching } = api.review.forReviewTable.useQuery(
		{
			visible: visibleFilter,
			deleted: deletedFilter,
			rating: ratingFilter ? Number(ratingFilter) : undefined,
			search: debouncedGlobalFilter || undefined,
			createdAt: dateFilter('createdAt')
				? { from: dateFilter('createdAt')?.[0], to: dateFilter('createdAt')?.[1] }
				: undefined,
			sorting: sorting.map(({ id, desc }) => ({
				id: id as ReviewSortColumn,
				desc,
			})),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const columns = useMemo<DataTableColumn<ReviewRecord>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 90,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: createActionsCell({
					theme,
					isManagerOrHigher,
					onDelete: deleteMutation.mutate,
					onUndelete: unDeleteMutation.mutate,
				}),
			},
			{
				id: 'id',
				header: 'ID',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				cell: IdCell,
			},
			{
				id: 'userName',
				header: 'User Name',
				size: 160,
				accessorFn: (row) => row.user?.name || 'Anonymous',
				cell: UserNameCell,
			},
			{
				id: 'userEmail',
				header: 'User Email',
				size: 220,
				accessorFn: (row) => row.user?.email || '',
				cell: UserEmailCell,
			},
			{
				id: 'rating',
				header: 'Rating',
				size: 120,
				filter: {
					type: 'select',
					options: [1, 2, 3, 4, 5].map((n) => ({
						value: String(n),
						label: `${n} star${n === 1 ? '' : 's'}`,
					})),
				},
				cell: RatingCell,
			},
			{
				id: 'reviewText',
				header: 'Review Content',
				size: 600,
				cell: createReviewTextCell(variants),
			},
			{
				id: 'organization',
				header: 'Organization',
				size: 220,
				accessorFn: (row) => row.organization?.name || 'Unknown',
				cell: OrganizationCell,
			},
			{
				id: 'visible',
				header: 'Visible?',
				hiddenByDefault: true,
				enableSorting: false,
				cell: createVisibleCell(handleToggleVisibility),
			},
			{
				id: 'status',
				header: 'Status',
				size: 220,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: StatusCell,
			},
			{
				id: 'createdAt',
				header: 'Created',
				size: 160,
				filter: { type: 'date-range' },
				cell: CreatedAtCell,
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
						label={getVisibleFilterLabel}
						icon={getVisibleFilterIcon}
					/>
					<TableToolbarToggle
						columnId='deleted'
						columnFilters={columnFilters}
						setColumnFilters={setColumnFilters}
						cycle={[false, true, undefined]}
						label={getDeletedFilterLabel}
						icon={getDeletedFilterIcon}
						slash={isDeletedFilterSlashed}
					/>
				</>
			}
		/>
	)
}
