import {
	ActionIcon,
	type ComboboxRenderPillInput,
	Group,
	type MantineTheme,
	Menu,
	MultiSelect,
	Pill,
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
import {
	STATUS_FILTER_TO_REASON,
	type TStatusFilter,
} from '@weareinreach/api/router/organization/query.forOrganizationTable.schema'
import { type OrgUnpublishedReason } from '@weareinreach/db/enums'
import { ORG_UNPUBLISHED_REASON_LABELS } from '@weareinreach/db/enums/labels'
import { Link } from '~ui/components/core/Link'
import { UnpublishReasonPopover } from '~ui/components/core/UnpublishReasonPopover'
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

/**
 * Row action that both unpublishes-with-a-reason and re-triages the reason on an already-unpublished org -
 * deliberately one-directional (see docs/DataPortal/2026-Redesign/unpublished-status.md): it can never
 * re-publish. Publishing has a real public consequence (the org becomes searchable again), so that stays on
 * the org's own edit page where the content was just reviewed, not a one-click table action.
 */
const SetStatusPopover = ({ row }: { row: RowItem }) => {
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()

	return (
		<UnpublishReasonPopover
			slug={row.slug}
			currentReason={row.unpublishedReason as OrgUnpublishedReason | null}
			onSuccess={() => apiUtils.organization.forOrganizationTable.invalidate()}
		>
			<Tooltip label='Set status'>
				<ActionIcon variant='subtle'>
					<Icon icon='carbon:tag' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</UnpublishReasonPopover>
	)
}

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
			{/* Set Status / activity log / internal notes are org-scoped only - none of the three have a
			location-level equivalent today, so they don't appear on location sub-rows. */}
			{!isSubRow && (
				<>
					<SetStatusPopover row={row as RowItem} />
					{/* Audit Log and Internal Notes are used far less often than View/Edit/Set Status, so they're
					consolidated behind a single overflow trigger rather than staying always-visible icons.
					Default `closeOnItemClick` behavior (true) is correct here - unlike `ActionButtons/Menu.tsx`'s
					`OverflowMenu` (which needs `false` because ITS items open their own modal after a delay,
					risking the menu unmounting them first), `auditOpen`/`notesOpen` live on this component, not
					inside the Menu, so closing the menu immediately doesn't affect whether the Drawer renders. */}
					<Menu position='bottom-end' shadow='md'>
						<Menu.Target>
							<Tooltip label='More actions'>
								<ActionIcon variant='subtle'>
									<Icon icon='carbon:overflow-menu-vertical' color={theme.other.colors.primary.allyGreen} />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item leftSection={<Icon icon='carbon:time' />} onClick={handleOpenAudit}>
								View activity log
							</Menu.Item>
							<Menu.Item leftSection={<Icon icon='carbon:notebook' />} onClick={handleOpenNotes}>
								View internal notes
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
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

// Options for the toolbar's Status dropdown - supersedes the old Publish Status (All/Published/
// Unpublished) filter. The reason rows are derived from STATUS_FILTER_TO_REASON (the same hyphenated
// wire-format -> enum map the real handler and mock data use) so a new reason only needs adding there
// and to ORG_UNPUBLISHED_REASON_LABELS, not a third time here. Deliberately NOT built from REASON_OPTIONS,
// which uses the raw OrgUnpublishedReason enum keys ('NEW', 'IN_PROGRESS', ...) for the popover's own
// mutation input - two different vocabularies that happen to share labels; conflating them sends the
// wrong value. "All" is a real, exclusive option here (not a placeholder) - selecting it clears any other
// selection, and selecting a real status while "All" is active drops "All." Never sent to the backend as
// a filter value itself - it just means the columnFilters entry for 'status' is empty/absent.
const STATUS_FILTER_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'published', label: 'Published' },
	...Object.entries(STATUS_FILTER_TO_REASON).map(([value, reason]) => ({
		value,
		label: ORG_UNPUBLISHED_REASON_LABELS[reason],
	})),
]

/**
 * Custom pill renderer for the Status MultiSelect. `Pill`'s own remove button is a plain `CloseButton` with
 * no size override, so it inherits the app-wide theme default - a hardcoded 24px icon (`theme/common.tsx`'s
 * `CloseButton.defaultProps`, sized for contexts like Modal/Drawer close buttons) that's wildly oversized for
 * a small inline pill. Overriding `removeButtonProps.icon` (and explicitly nulling `children`, since the
 * theme default sets `children` specifically, not `icon`) replaces it with a properly small one instead of
 * trying to fight it via CSS.
 */
const renderStatusPill = ({ option, onRemove }: ComboboxRenderPillInput) => (
	<Pill
		size='xs'
		withRemoveButton
		onRemove={onRemove}
		removeButtonProps={{
			icon: <Icon icon='carbon:close' width={10} height={10} />,
			children: null,
			style: { minWidth: 16, width: 16, height: 16 },
		}}
	>
		{option.label}
	</Pill>
)

// Options for the toolbar's Create Method dropdown - see createMethodWhere in
// query.forOrganizationTable.handler.ts for how each category maps to source/creatorHadDpAccess.
// 'internal' unions suggested-with-access and data-portal-added - both mean "not the public."
const CREATE_METHOD_OPTIONS = [
	{ value: 'all', label: 'All' },
	{ value: 'public', label: 'Public' },
	{ value: 'internal', label: 'Internal' },
]

const CREATE_METHOD_HELP_TEXT =
	'All: every organization.' +
	'Public: submitted through the public suggestion form by someone without Data Portal access.' +
	'Internal: submitted by staff/volunteers with Data Portal access, or added ' +
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

// Same idea as COMPACT_SELECT_STYLES, but for the Status MultiSelect specifically. The app-wide theme
// hardcodes a real `height: 48px` CSS rule on every input (theme/components/Input.module.css) - omitting
// an explicit `height` override here (as a first pass did) leaves that rule in charge, since `minHeight`
// alone never wins against an already-larger fixed `height` from another source. `height: 'auto'`
// explicitly hands control back to the content, so the box matches the plain Select at rest and actually
// grows to show every wrapped pill instead of clipping at a fixed height.
const COMPACT_MULTISELECT_STYLES = {
	input: { height: 'auto', minHeight: 30, fontSize: 'var(--mantine-font-size-xs)', padding: '2px 8px' },
	label: { fontSize: 'var(--mantine-font-size-xs)' },
	// `Pill` defaults its own `size` to 'sm' regardless of the MultiSelect's `size='xs'` - it doesn't
	// inherit automatically. The remove ("X") button's icon is sized in `em` units relative to the
	// pill's own font-size, so without this it renders noticeably larger than xs-sized content
	// elsewhere (e.g. the selected-option checkmark in the dropdown, which does scale with size).
	pill: { fontSize: 'var(--mantine-font-size-xs)' },
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

	// Matches ZStatusFilter in query.forOrganizationTable.schema.ts - multi-select, so several chosen
	// values union (OR); this only filters which orgs show up, never sets more than one status on an org.
	const statusFilter = columnFilters.find(({ id }) => id === 'status')?.value as TStatusFilter[] | undefined
	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const createMethodFilter = columnFilters.find(({ id }) => id === 'createMethod')?.value as
		'public' | 'internal' | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(
		{
			status: statusFilter,
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
				// Derived, not stored - reads published/unpublishedReason straight off the row. Supersedes the
				// old hidden 'published' column entirely; see the toolbar's Status filter below.
				id: 'status',
				header: 'Status',
				size: 160,
				enableSorting: false,
				cell: ({ row }) => {
					const org = row as RowItem
					if (org.published) return 'Published'
					return org.unpublishedReason ? ORG_UNPUBLISHED_REASON_LABELS[org.unpublishedReason] : ''
				},
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
						<MultiSelect
							size='xs'
							label='Status'
							styles={COMPACT_MULTISELECT_STYLES}
							data={STATUS_FILTER_OPTIONS}
							value={statusFilter?.length ? statusFilter : ['all']}
							onChange={(next) => {
								setColumnFilters((prev) => {
									const withoutStatus = prev.filter(({ id }) => id !== 'status')
									const wasShowingAll = !statusFilter?.length
									// "All" is exclusive: picking it while real statuses were selected clears them;
									// picking a real status while "All" was showing drops "All."
									const resolved =
										next.includes('all') && next.length > 1
											? wasShowingAll
												? next.filter((v) => v !== 'all')
												: ['all']
											: next
									const realValues = resolved.filter((v) => v !== 'all')
									return realValues.length > 0
										? [...withoutStatus, { id: 'status', value: realValues }]
										: withoutStatus
								})
							}}
							renderPill={renderStatusPill}
							w={190}
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
