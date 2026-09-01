import {
	ActionIcon,
	Group,
	type MantineTheme,
	Select,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { type Route } from 'nextjs-routes'
import { useCallback, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { AuditDrawer } from '~ui/components/data-portal/AuditDrawer'
import { InternalNotesDrawer } from '~ui/components/data-portal/InternalNotesDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'
import { ResultCount } from './ResultCount'
import { TableToolbarToggle } from './TableToolbarToggle'

type RowItem = ApiOutput['organization']['forOrganizationTable']['results'][number]
type LocationRow = RowItem['locations'][number]
/** A rendered row is either a top-level org or one of its expanded location sub-rows. */
type TableRow = RowItem | LocationRow
/** Columns the server-side query can sort by. */
type SortableColumnId = 'name' | 'lastVerified' | 'updatedAt' | 'createdAt'

const RowAction = ({
	row,
	isSubRow,
	parentSlug,
}: {
	row: TableRow
	isSubRow: boolean
	parentSlug?: string
}) => {
	const [auditOpen, setAuditOpen] = useState(false)
	const [notesOpen, setNotesOpen] = useState(false)
	const theme = useMantineTheme()

	const handleOpenAudit = useCallback(() => setAuditOpen(true), [])
	const handleCloseAudit = useCallback(() => setAuditOpen(false), [])
	const handleOpenNotes = useCallback(() => setNotesOpen(true), [])
	const handleCloseNotes = useCallback(() => setNotesOpen(false), [])

	const getViewUrl = (): Route =>
		isSubRow && parentSlug
			? { pathname: '/org/[slug]/[orgLocationId]', query: { slug: parentSlug, orgLocationId: row.id } }
			: { pathname: '/org/[slug]', query: { slug: (row as RowItem).slug } }
	const getEditUrl = (): Route =>
		isSubRow && parentSlug
			? { pathname: '/org/[slug]/[orgLocationId]/edit', query: { slug: parentSlug, orgLocationId: row.id } }
			: { pathname: '/org/[slug]/edit', query: { slug: (row as RowItem).slug } }

	return (
		<Group wrap='nowrap' gap={8}>
			<Tooltip label='View'>
				<ActionIcon variant='subtle' component={Link} href={getViewUrl()} target='_blank'>
					<Icon icon='carbon:search' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit'>
				<ActionIcon variant='subtle' component={Link} href={getEditUrl()} target='_blank'>
					<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			{/* Activity log / internal notes are org-scoped only - neither drawer has a location-level
			equivalent today, so these two actions don't appear on location sub-rows. */}
			{!isSubRow && (
				<>
					<Tooltip label='View activity log'>
						<ActionIcon variant='subtle' onClick={handleOpenAudit}>
							<Icon icon='carbon:time' color={theme.other.colors.primary.allyGreen} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label='View internal notes'>
						<ActionIcon variant='subtle' onClick={handleOpenNotes}>
							<Icon icon='carbon:notebook' color={theme.other.colors.primary.allyGreen} />
						</ActionIcon>
					</Tooltip>
					{auditOpen && (
						<AuditDrawer
							opened={auditOpen}
							onClose={handleCloseAudit}
							recordId={row.id}
							name={(row as RowItem).name}
						/>
					)}
					{notesOpen && (
						<InternalNotesDrawer
							opened={notesOpen}
							onClose={handleCloseNotes}
							recordId={row.id}
							name={(row as RowItem).name}
						/>
					)}
				</>
			)}
		</Group>
	)
}

/** Cell renderer for the 'actions' column - view/edit/audit/notes actions for a row. */
const ActionsCell = ({ row, depth, parentRow }: DataTableCellContext<TableRow>) => (
	<RowAction
		row={row}
		isSubRow={depth > 0}
		parentSlug={depth > 0 ? (parentRow as RowItem | undefined)?.slug : undefined}
	/>
)

interface NameCellProps extends DataTableCellContext<TableRow> {
	variants: ReturnType<typeof useCustomVariant>
}

/** Cell renderer for the 'name' column - dims and flags unpublished orgs. */
const NameCell = ({ value, row, depth, variants }: NameCellProps) => {
	const isPublished = (row as RowItem).published
	const textVariant = !isPublished ? variants.Text.utility4darkGray : variants.Text.utility4
	return (
		<Group gap={8} wrap='nowrap' pl={depth > 0 ? 0 : undefined}>
			<Text variant={textVariant}>{value as string}</Text>
			{!isPublished && <Icon icon='carbon:view-off' />}
		</Group>
	)
}

/**
 * Curried factory for the 'name' column cell - `variants` isn't part of `DataTableCellContext`, so it's
 * threaded through here rather than via an inline arrow in the columns array.
 */
const createNameCell = (extra: { variants: ReturnType<typeof useCustomVariant> }) => {
	const Cell = (ctx: DataTableCellContext<TableRow>) => <NameCell {...ctx} {...extra} />
	Cell.displayName = 'NameCell'
	return Cell
}

/** Cell renderer for the 'id' column. */
const IdCell = ({ row }: DataTableCellContext<TableRow>) => <Text size='xs'>{row.id}</Text>

interface LastVerifiedCellProps extends DataTableCellContext<TableRow> {
	theme: MantineTheme
}

/** Cell renderer for the 'lastVerified' column - warns when a top-level org has never been verified. */
const LastVerifiedCell = ({ value, depth, theme }: LastVerifiedCellProps) => {
	if (depth > 0) {
		return null
	}
	if (!value) {
		return (
			<Group gap={4} c={theme.other.colors.tertiary.red}>
				<Icon icon='carbon:warning-filled' />
				<span>Never</span>
			</Group>
		)
	}
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

/**
 * Curried factory for the 'lastVerified' column cell - `theme` isn't part of `DataTableCellContext`, so it's
 * threaded through here rather than via an inline arrow in the columns array.
 */
const createLastVerifiedCell = (extra: { theme: MantineTheme }) => {
	const Cell = (ctx: DataTableCellContext<TableRow>) => <LastVerifiedCell {...ctx} {...extra} />
	Cell.displayName = 'LastVerifiedCell'
	return Cell
}

/** Cell renderer shared by the 'updatedAt' and 'createdAt' columns. */
const DateCell = ({ value }: DataTableCellContext<TableRow>) => {
	if (!value) {
		return null
	}
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

const getOrgTableSubRows = (row: TableRow): TableRow[] | undefined =>
	(row as RowItem).locations as TableRow[] | undefined

const getOrgTableRowStyle = (row: TableRow) => ({
	textDecoration: (row as RowItem).deleted ? 'line-through' : undefined,
})

const deletedFilterLabel = (state: boolean | undefined): string => {
	if (state) {
		return 'Show all'
	}
	if (state === undefined) {
		return 'Hide deleted'
	}
	return 'Show deleted'
}

const deletedFilterIcon = (): string => 'carbon:trash-can'

const isDeletedFilterExcluded = (state: boolean | undefined): boolean => state === false

// Options for the toolbar's Create Method dropdown - see createMethodWhere in
// query.forOrganizationTable.handler.ts for how each category maps to source/creatorHadDpAccess.
// 'internal' unions suggested-with-access and data-portal-added - both mean "not the public."
const CREATE_METHOD_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'public', label: 'Public' },
	{ value: 'internal', label: 'Internal' },
]

const CREATE_METHOD_HELP_TEXT =
	'All: every organization. Public: submitted through the public suggestion form by someone without ' +
	'Data Portal access. Internal: submitted by staff/volunteers with Data Portal access, or added ' +
	'directly through the Data Portal.'

const CreateMethodLabel = () => (
	<Group gap={4} wrap='nowrap'>
		<span>Create Method</span>
		<Tooltip label={CREATE_METHOD_HELP_TEXT} multiline w={260}>
			<Icon icon='carbon:information' width={14} height={14} style={{ cursor: 'help' }} />
		</Tooltip>
	</Group>
)

// The app-wide Input/InputWrapper theme defaults hardcode a 48px height / 16px input font and a 16px
// label font on every field regardless of `size` (see theme/components/Input.module.css and
// InputWrapper.module.css) - fine for real form fields, but it defeats `size='xs'` on these two compact
// toolbar filters. Override just the input and label slots here rather than touching the global default,
// which other inputs rely on.
const COMPACT_SELECT_STYLES = {
	input: { height: 30, minHeight: 30, fontSize: 'var(--mantine-font-size-xs)', padding: '0 8px' },
	label: { fontSize: 'var(--mantine-font-size-xs)' },
}

/**
 * The org directory's system-of-record table - publish status, verification date, deletion flag, and each
 * org's locations. Filtering, sorting, and pagination all run server-side (`forOrganizationTable`).
 */
export const OrganizationTable = () => {
	const variants = useCustomVariant()
	const theme = useMantineTheme()

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'deleted', value: false }])
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const publishedFilter = columnFilters.find(({ id }) => id === 'published')?.value as boolean | undefined
	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const createMethodFilter = columnFilters.find(({ id }) => id === 'createMethod')?.value as
		'public' | 'internal' | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(
		{
			published: publishedFilter,
			deleted: deletedFilter,
			createMethod: createMethodFilter,
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
				id: id as SortableColumnId,
				desc,
			})),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const results = data?.results ?? []
	const total = data?.total ?? 0

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
			{
				id: 'name',
				header: 'Name',
				pin: 'left',
				size: 280,
				cell: createNameCell({ variants }),
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
				id: 'lastVerified',
				header: 'Verified',
				size: 150,
				filter: { type: 'date-range' },
				cell: createLastVerifiedCell({ theme }),
			},
			{
				id: 'updatedAt',
				header: 'Updated',
				size: 150,
				filter: { type: 'date-range' },
				cell: DateCell,
			},
			{
				id: 'createdAt',
				header: 'Created',
				size: 150,
				filter: { type: 'date-range' },
				cell: DateCell,
			},
			{
				id: 'published',
				header: 'Published',
				hiddenByDefault: true,
				enableSorting: false,
				cell: ({ value }) => (value === undefined ? '' : String(value)),
			},
			{
				id: 'deleted',
				header: 'Deleted',
				hiddenByDefault: true,
				enableSorting: false,
				cell: ({ value }) => (value === undefined ? '' : String(value)),
			},
			{
				// Display-only - the actual filter is a standalone toolbar dropdown (see toolbarExtra
				// below), not this column's own header filter, since hiddenByDefault columns don't render
				// a header at all (so a column-scoped filter icon would be just as hidden as the column).
				id: 'createMethod',
				header: 'Create Method',
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				// Matches the toolbar filter's own two categories - same source/creatorHadDpAccess logic as
				// createMethodWhere in query.forOrganizationTable.handler.ts.
				cell: ({ row }) => {
					const org = row as RowItem
					if (org.source?.source === 'data-portal') return 'Internal'
					if (org.source?.source === 'suggestion') {
						return org.creatorHadDpAccess ? 'Internal' : 'Public'
					}
					return ''
				},
			},
		],
		[variants, theme]
	)

	return (
		<Stack gap='sm'>
			<ResultCount count={total} />
			<DataTable
				data={results as TableRow[]}
				columns={columns}
				getSubRows={getOrgTableSubRows}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				sorting={sorting}
				onSortingChange={setSorting}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				globalFilterPlaceholder='Search Organizations'
				pagination={pagination}
				onPaginationChange={setPagination}
				mode={{ serverSide: true, rowCount: total }}
				isLoading={isLoading}
				isFetching={isFetching}
				isError={isError}
				getRowStyle={getOrgTableRowStyle}
				toolbarExtra={
					<>
						<Select
							size='xs'
							label='Publish Status'
							styles={COMPACT_SELECT_STYLES}
							data={[
								{ value: 'all', label: 'All' },
								{ value: 'published', label: 'Published' },
								{ value: 'unpublished', label: 'Unpublished' },
							]}
							value={publishedFilter === undefined ? 'all' : publishedFilter ? 'published' : 'unpublished'}
							onChange={(next) => {
								setColumnFilters((prev) => {
									const withoutPublished = prev.filter(({ id }) => id !== 'published')
									if (next === 'published') return [...withoutPublished, { id: 'published', value: true }]
									if (next === 'unpublished') return [...withoutPublished, { id: 'published', value: false }]
									return withoutPublished
								})
							}}
							allowDeselect={false}
							w={110}
						/>
						<Select
							size='xs'
							label={<CreateMethodLabel />}
							styles={COMPACT_SELECT_STYLES}
							data={CREATE_METHOD_OPTIONS}
							value={createMethodFilter ?? 'all'}
							onChange={(next) => {
								setColumnFilters((prev) => {
									const withoutCreateMethod = prev.filter(({ id }) => id !== 'createMethod')
									return next === 'public' || next === 'internal'
										? [...withoutCreateMethod, { id: 'createMethod', value: next }]
										: withoutCreateMethod
								})
							}}
							allowDeselect={false}
							w={110}
						/>
						<TableToolbarToggle
							columnId='deleted'
							columnFilters={columnFilters}
							setColumnFilters={setColumnFilters}
							cycle={[false, true, undefined]}
							label={deletedFilterLabel}
							icon={deletedFilterIcon}
							slash={isDeletedFilterExcluded}
						/>
					</>
				}
			/>
		</Stack>
	)
}
