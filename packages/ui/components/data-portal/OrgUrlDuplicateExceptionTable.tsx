import { ActionIcon, Group, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useCallback, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ActionItem, ConfirmBody } from './ActionItem'
import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'
import { OrgUrlDuplicateExceptionForm } from './OrgUrlDuplicateExceptionForm'
import { OrgUrlExceptionAuditDrawer } from './OrgUrlExceptionAuditDrawer'
import { OrgUrlExceptionNotesDrawer } from './OrgUrlExceptionNotesDrawer'
import { ResultCount } from './ResultCount'

type RowItem = NonNullable<ApiOutput['orgUrlDuplicateException']['forTable']>['results'][number]
type MatchingOrgRow = RowItem['matchingOrgs'][number]
/** A rendered row is either a top-level exception or one of its expanded matching-organization sub-rows. */
type TableRow = RowItem | MatchingOrgRow

type SortableColumnId = 'baseUrl' | 'active' | 'createdAt' | 'updatedAt'

const isExceptionRow = (row: TableRow): row is RowItem => 'baseUrl' in row

const EditAction = ({ row }: { row: RowItem }) => {
	const [opened, handler] = useDisclosure(false)
	return (
		<ActionItem
			tooltipLabel='Edit'
			modalTitle='Edit Base URL Exception'
			icon='carbon:edit'
			opened={opened}
			onOpen={handler.open}
			onClose={handler.close}
		>
			<OrgUrlDuplicateExceptionForm existing={row} onSettled={handler.close} />
		</ActionItem>
	)
}

const DeleteRestoreAction = ({ row }: { row: RowItem }) => {
	const [opened, handler] = useDisclosure(false)
	const apiUtils = api.useUtils()

	const onSettled = useCallback(() => {
		apiUtils.orgUrlDuplicateException.forTable.invalidate()
		handler.close()
	}, [apiUtils, handler])

	const deleteException = api.orgUrlDuplicateException.delete.useMutation({ onSettled })
	const restore = api.orgUrlDuplicateException.unDelete.useMutation({ onSettled })
	const mutation = row.active ? deleteException : restore

	const handleConfirm = useCallback(() => {
		mutation.mutate({ id: row.id })
	}, [mutation, row.id])

	return (
		<ActionItem
			tooltipLabel={row.active ? 'Delete' : 'Restore'}
			modalTitle={row.active ? 'Delete Base URL Exception' : 'Restore Base URL Exception'}
			icon={row.active ? 'carbon:subtract-alt' : 'carbon:renew'}
			opened={opened}
			onOpen={handler.open}
			onClose={handler.close}
		>
			<ConfirmBody
				explanation={
					row.active
						? "Deleting this exception means this base domain's duplicate check goes back to normal - a full-URL match under it will be flagged again."
						: "Restoring this exception means this base domain's duplicate check is exempted again - a differing full URL under it won't be flagged."
				}
				confirmText={`Are you sure you want to ${row.active ? 'delete' : 'restore'} this exception?`}
				isPending={mutation.isPending}
				onConfirm={handleConfirm}
				onCancel={handler.close}
			/>
		</ActionItem>
	)
}

const NotesAction = ({ row }: { row: RowItem }) => {
	const [opened, handler] = useDisclosure(false)
	const theme = useMantineTheme()

	return (
		<>
			<OrgUrlExceptionNotesDrawer
				opened={opened}
				onClose={handler.close}
				exceptionId={row.id}
				baseUrl={row.baseUrl}
			/>
			<Tooltip label='View Internal Notes'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:notebook' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

const AuditLogAction = ({ row }: { row: RowItem }) => {
	const [opened, handler] = useDisclosure(false)
	const theme = useMantineTheme()

	return (
		<>
			<OrgUrlExceptionAuditDrawer
				opened={opened}
				onClose={handler.close}
				exceptionId={row.id}
				baseUrl={row.baseUrl}
			/>
			<Tooltip label='View Activity Log'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:time' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

/** Cell renderer for the 'actions' column - blank for a matching-organization sub-row. */
const ActionsCell = ({ row }: DataTableCellContext<TableRow>) => {
	if (!isExceptionRow(row)) {
		return null
	}
	return (
		<Group wrap='nowrap' gap={8}>
			<EditAction row={row} />
			<DeleteRestoreAction row={row} />
			<AuditLogAction row={row} />
			<NotesAction row={row} />
		</Group>
	)
}

/** Cell renderer for the 'baseUrl' column - a sub-row shows the matching organization's name instead. */
const BaseUrlCell = ({ row }: DataTableCellContext<TableRow>) => {
	if (isExceptionRow(row)) {
		return <Text>{row.baseUrl}</Text>
	}
	const status = row.deleted ? ' (deleted)' : !row.published ? ' (unpublished)' : ''
	return (
		<Text size='sm' c='dimmed'>
			{row.name}
			{status}
		</Text>
	)
}

const DescriptionCell = ({ row }: DataTableCellContext<TableRow>) =>
	isExceptionRow(row) ? <Text size='sm'>{row.description}</Text> : null

const ActiveCell = ({ row }: DataTableCellContext<TableRow>) =>
	isExceptionRow(row) ? <span>{row.active ? 'Active' : 'Deleted'}</span> : null

const AddedByCell = ({ row }: DataTableCellContext<TableRow>) =>
	isExceptionRow(row) ? <Text size='sm'>{row.createdBy?.name ?? row.createdBy?.email}</Text> : null

/** Cell renderer shared by the 'createdAt' and 'updatedAt' columns. */
const DateCell = ({ row, value }: DataTableCellContext<TableRow>) => {
	if (!isExceptionRow(row) || !value) {
		return null
	}
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

export const OrgUrlDuplicateExceptionTable = () => {
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'baseUrl', desc: false }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isFetching, isError } = api.orgUrlDuplicateException.forTable.useQuery(
		{
			search: debouncedGlobalFilter || undefined,
			createdAt: dateFilter('createdAt')
				? { from: dateFilter('createdAt')?.[0], to: dateFilter('createdAt')?.[1] }
				: undefined,
			updatedAt: dateFilter('updatedAt')
				? { from: dateFilter('updatedAt')?.[0], to: dateFilter('updatedAt')?.[1] }
				: undefined,
			sorting: sorting.map(({ id, desc }) => ({ id: id as SortableColumnId, desc })),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const getSubRows = useCallback(
		(row: TableRow): TableRow[] | undefined =>
			isExceptionRow(row) ? (row.matchingOrgs as TableRow[]) : undefined,
		[]
	)

	const columns = useMemo<DataTableColumn<TableRow>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 180,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: ActionsCell,
			},
			{ id: 'baseUrl', header: 'Base URL', cell: BaseUrlCell },
			{ id: 'description', header: 'Description', enableSorting: false, cell: DescriptionCell },
			{ id: 'active', header: 'Active', cell: ActiveCell },
			{ id: 'addedBy', header: 'Added By', enableSorting: false, cell: AddedByCell },
			{ id: 'createdAt', header: 'Created', filter: { type: 'date-range' }, cell: DateCell },
			{ id: 'updatedAt', header: 'Updated', filter: { type: 'date-range' }, cell: DateCell },
		],
		[]
	)

	return (
		<Stack>
			<ResultCount count={data?.total ?? 0} />
			<DataTable
				data={(data?.results ?? []) as TableRow[]}
				columns={columns}
				sorting={sorting}
				onSortingChange={setSorting}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				globalFilterPlaceholder='Search base URL or description'
				pagination={pagination}
				onPaginationChange={setPagination}
				mode={{ serverSide: true, rowCount: data?.total ?? 0 }}
				isLoading={isLoading}
				isFetching={isFetching}
				isError={isError}
				getSubRows={getSubRows}
			/>
		</Stack>
	)
}
