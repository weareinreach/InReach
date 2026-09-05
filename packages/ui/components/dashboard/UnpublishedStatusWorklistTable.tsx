import { ActionIcon, Group, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { type Route } from 'nextjs-routes'
import { useMemo, useState } from 'react'

import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { UnpublishReasonPopover } from '~ui/components/core/UnpublishReasonPopover'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from '../data-portal/DataTable'

type RowItem = ApiOutput['dashboard']['unpublishedStatusWorklist']['results'][number]
type SortableColumnId = 'name' | 'createdAt' | 'lastVerified' | 'updatedAt'

/**
 * Row actions for the worklist - View/Edit the org, plus the same Set Status popover used on the
 * Organizations table, so a reviewer can actually resolve what they see without leaving the page.
 */
const RowAction = ({ row }: { row: RowItem }) => {
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()

	const viewUrl: Route = { pathname: '/org/[slug]', query: { slug: row.slug } }
	const editUrl: Route = { pathname: '/org/[slug]/edit', query: { slug: row.slug } }

	return (
		<Group wrap='nowrap' gap={8}>
			<Tooltip label='View'>
				<ActionIcon variant='subtle' component={Link} href={viewUrl} target='_blank'>
					<Icon icon='carbon:search' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit'>
				<ActionIcon variant='subtle' component={Link} href={editUrl} target='_blank'>
					<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			<UnpublishReasonPopover
				slug={row.slug}
				// Every row here is `unpublishedReason IS NULL` by definition (that's what the worklist
				// query filters on) - there's never a current value to pre-fill.
				currentReason={null}
				onSuccess={() => apiUtils.dashboard.unpublishedStatusWorklist.invalidate()}
			>
				<Tooltip label='Set status'>
					<ActionIcon variant='subtle'>
						<Icon icon='carbon:tag' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			</UnpublishReasonPopover>
		</Group>
	)
}

const ActionsCell = ({ row }: DataTableCellContext<RowItem>) => <RowAction row={row} />

const DateCell = ({ value }: DataTableCellContext<RowItem>) => {
	if (!value) {
		return null
	}
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

const columns: DataTableColumn<RowItem>[] = [
	{
		id: 'actions',
		header: 'Actions',
		pin: 'left',
		size: 130,
		enableSorting: false,
		enableGlobalFilter: false,
		hideable: false,
		accessorFn: () => undefined,
		cell: ActionsCell,
	},
	{
		id: 'name',
		header: 'Name',
		pin: 'left',
		size: 260,
		cell: ({ row }) => (row as RowItem).name,
	},
	{
		id: 'tier',
		header: 'Group',
		size: 340,
		enableSorting: false,
		cell: ({ row }) => <Text size='sm'>{(row as RowItem).tier}</Text>,
	},
	{
		id: 'createdAt',
		header: 'Created',
		size: 150,
		cell: DateCell,
	},
	{
		id: 'lastVerified',
		header: 'Verified',
		size: 150,
		cell: DateCell,
	},
	{
		id: 'updatedAt',
		header: 'Updated',
		size: 150,
		cell: DateCell,
	},
	{
		id: 'deleted',
		header: 'Deleted',
		size: 100,
		enableSorting: false,
		cell: ({ row }) => ((row as RowItem).deleted ? 'Yes' : ''),
	},
]

export interface UnpublishedStatusWorklistTableProps {
	/**
	 * Pre-filters to one tier (e.g. from the summary page's `?tier=` link) - not a live, user-editable filter
	 * control in this first pass, just an incoming scope.
	 */
	tier?: string
}

/**
 * The Unpublished Status dashboard's drill-down list - deliberately mirrors OrganizationTable.tsx's own
 * conventions (server-side pagination/sorting, same DataTable wrapper, same Set Status action) rather than
 * being a bespoke report view. See docs/Dashboards/UnpublishedStatus/README.md.
 */
export const UnpublishedStatusWorklistTable = ({ tier }: UnpublishedStatusWorklistTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: false }])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)

	const { data, isLoading, isFetching, isError } = api.dashboard.unpublishedStatusWorklist.useQuery(
		{
			tier: tier as ApiInput['dashboard']['unpublishedStatusWorklist']['tier'],
			search: debouncedGlobalFilter || undefined,
			sorting: sorting.map(({ id, desc }) => ({ id: id as SortableColumnId, desc })),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const results = data?.results ?? []
	const total = data?.total ?? 0
	const memoColumns = useMemo(() => columns, [])

	return (
		<DataTable
			data={results}
			columns={memoColumns}
			sorting={sorting}
			onSortingChange={setSorting}
			globalFilter={globalFilter}
			onGlobalFilterChange={setGlobalFilter}
			globalFilterPlaceholder='Search by name'
			pagination={pagination}
			onPaginationChange={setPagination}
			mode={{ serverSide: true, rowCount: total }}
			isLoading={isLoading}
			isFetching={isFetching}
			isError={isError}
		/>
	)
}
