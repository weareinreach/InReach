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
	type TRemoteOption,
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
import { FilterChip } from './FilterChip'
import {
	COMPACT_MULTISELECT_STYLES,
	GroupedMultiSelect,
	type GroupedMultiSelectGroup,
} from './GroupedMultiSelect'
import { ResultCount } from './ResultCount'

type RowItem = ApiOutput['organization']['forOrganizationTable']['results'][number]
type LocationRow = RowItem['locations'][number]
/** A rendered row is either a top-level org or one of its expanded location sub-rows. */
type TableRow = RowItem | LocationRow
/** Columns the server-side query can sort by. */
type SortableColumnId = 'name' | 'lastVerified' | 'updatedAt' | 'createdAt'

/**
 * Row action that both unpublishes-with-a-reason and re-triages the reason on an already-unpublished org -
 * deliberately one-directional (see docs/DataPortal/Organizations/README.md): it can never re-publish.
 * Publishing has a real public consequence (the org becomes searchable again), so that stays on the org's own
 * edit page where the content was just reviewed, not a one-click table action.
 */
const SetStatusPopover = ({ row }: { row: RowItem }) => {
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()

	return (
		<UnpublishReasonPopover
			slug={row.slug}
			currentReason={row.unpublishedReason as OrgUnpublishedReason | null}
			onSuccess={() => {
				apiUtils.organization.forOrganizationTable.invalidate()
				// The mutation always writes a new InternalNote (typed or auto-generated fallback text) -
				// without this, a previously-opened notes drawer for this org keeps showing its stale cache.
				apiUtils.internalNote.getAllForRecord.invalidate()
			}}
		>
			<Tooltip label='Set status'>
				<ActionIcon variant='subtle' aria-label='Set status'>
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
				<ActionIcon variant='subtle' component={Link} href={getViewUrl()} target='_blank' aria-label='View'>
					<Icon icon='carbon:search' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit'>
				<ActionIcon variant='subtle' component={Link} href={getEditUrl()} target='_blank' aria-label='Edit'>
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
								<ActionIcon variant='subtle' aria-label='More actions'>
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

/**
 * Cell renderer for the 'createdBy' column - reads the org's earliest Suggestion's submitter (see
 * `creatorOrgIds` in query.forOrganizationTable.handler.ts). Null for orgs predating that flow, or for a
 * location sub-row (creator is an org-level concept only).
 */
const CreatedByCell = ({ row, depth }: DataTableCellContext<TableRow>) => {
	if (depth > 0) {
		return null
	}
	const creator = (row as RowItem).suggestions?.[0]?.suggestedBy
	if (!creator) {
		return (
			<Text size='sm' c='dimmed'>
				Unknown
			</Text>
		)
	}
	return <Text size='sm'>{creator.name || creator.email}</Text>
}

/**
 * Curried factory for a column that renders one of an org's own id arrays (Community/Leader Badge's shared
 * `attributeIds`, Service Tags' `serviceIds`, Service Attributes'/Remote Options' server-computed summary
 * fields - see ORG_SELECT/withServiceSummaries in query.forOrganizationTable.handler.ts) as a row of pills,
 * resolving each id through `labelById` and silently dropping any id that map doesn't cover (e.g. an id
 * belonging to a different category than this particular column). Org-level only, same as CreatedByCell - a
 * location sub-row has no community/service data of its own.
 */
const createPillListCell = ({
	getIds,
	labelById,
}: {
	getIds: (row: RowItem) => string[]
	labelById: Map<string, string>
}) => {
	const Cell = ({ row, depth }: DataTableCellContext<TableRow>) => {
		if (depth > 0) {
			return null
		}
		const labels = getIds(row as RowItem)
			.map((id) => labelById.get(id))
			.filter((label): label is string => Boolean(label))
		if (!labels.length) {
			return null
		}
		return (
			<Group gap={4} wrap='wrap'>
				{labels.map((label) => (
					<Pill key={label} size='xs'>
						{label}
					</Pill>
				))}
			</Group>
		)
	}
	Cell.displayName = 'PillListCell'
	return Cell
}

const getOrgTableSubRows = (row: TableRow): TableRow[] | undefined =>
	(row as RowItem).locations as TableRow[] | undefined

const getOrgTableRowStyle = (row: TableRow) => ({
	textDecoration: (row as RowItem).deleted ? 'line-through' : undefined,
})

// Tri-state - a plain `Select` needs its own string values, unlike the `boolean | undefined` the rest of
// the app stores this filter as (see `getOrgTableRowStyle`, ORG_SELECT's `deleted` field). 'all' is a real,
// selectable option here (unlike Status/Create Method, whose "no filter" state is `clearable` back to
// nothing) since there's no other value to fall back on: leaving this dropdown blank would be ambiguous
// between "show all" and "hide deleted" (the actual default).
const DELETED_FILTER_OPTIONS = [
	{ value: 'hide', label: 'Hide deleted' },
	{ value: 'show', label: 'Show deleted only' },
	{ value: 'all', label: 'Show all' },
]
const deletedFilterToValue = (state: boolean | undefined): string =>
	state === undefined ? 'all' : state ? 'show' : 'hide'
const deletedValueToFilter = (value: string | null): boolean | undefined => {
	if (value === 'show') return true
	if (value === 'hide') return false
	return undefined
}

/**
 * `ServiceCategory` has no plain display-name field, only a raw slug (e.g. "legal-aid") or a translated tsKey
 *
 * - Since translation isn't used in the data portal, this just turns the slug into something readable ("Legal
 *   Aid") rather than showing it verbatim.
 */
const formatSlugLabel = (slug: string): string =>
	slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')

/**
 * Resolves selected ids back to display labels for the "applied filters" summary. A group's own id is never
 * itself a selected value (see `GroupedMultiSelectGroup.cascadable`) except in the childless case, where the
 * group's single item id already equals it - so this only ever needs to check items.
 */
const labelsForSelection = (groups: GroupedMultiSelectGroup[], selected: string[]): string[] => {
	const labels: string[] = []
	for (const group of groups) {
		for (const item of group.items) {
			if (selected.includes(item.id)) {
				labels.push(item.label)
			}
		}
	}
	return labels
}

// Matches ZRemoteOption in query.forOrganizationTable.schema.ts. A single unnamed group (empty label) -
// GroupedMultiSelect skips rendering a header for it, since there's no real category here, just three
// flat, mutually exclusive-per-service options.
const REMOTE_OPTION_GROUPS: GroupedMultiSelectGroup[] = [
	{
		id: 'remote-options',
		label: '',
		items: [
			{ id: 'remote-no-location', label: 'Remote (no location)' },
			{ id: 'remote-with-location', label: 'Remote (available at a location)' },
			{ id: 'in-person-only', label: 'In-person only' },
		],
	},
]

// For the Remote Options table column's pill cell - reuses the same id/label pairs as the filter above
// rather than a second hand-written copy.
const REMOTE_OPTION_LABEL_BY_ID = new Map(
	REMOTE_OPTION_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label] as const))
)

// Every filter except Status/Create Method is added/removed as needed via the toolbar's "+ Filter" menu
// (see the `activeFacets` state) rather than sitting permanently in the toolbar.
type AddableFacetId =
	'deleted' | 'community' | 'leaderBadge' | 'serviceTags' | 'serviceAttributes' | 'remoteOptions'

const ADDABLE_FACETS: { id: AddableFacetId; label: string }[] = [
	{ id: 'deleted', label: 'Deleted' },
	{ id: 'community', label: 'Community' },
	{ id: 'leaderBadge', label: 'Leader Badge' },
	{ id: 'serviceTags', label: 'Service Tags' },
	{ id: 'serviceAttributes', label: 'Service Attributes' },
	{ id: 'remoteOptions', label: 'Remote Options' },
]

// Options for the Status filter - shared by the toolbar MultiSelect below and the Status column's own
// header filter, both of which read/write the same `columnFilters` 'status' entry. The reason rows are
// derived from STATUS_FILTER_TO_REASON (the same hyphenated wire-format -> enum map the real handler and
// mock data use) so a new reason only needs adding there and to ORG_UNPUBLISHED_REASON_LABELS, not a third
// time here. Deliberately NOT built from REASON_OPTIONS, which uses the raw OrgUnpublishedReason enum keys
// ('NEW', 'IN_PROGRESS', ...) for the popover's own mutation input - two different vocabularies that happen
// to share labels; conflating them sends the wrong value. No "All" entry - picking zero statuses already
// means "show all," same convention every other filter in the app uses; the toolbar widget shows "All" as
// a placeholder (see its `placeholder` prop below) rather than a real, selectable value.
const STATUS_FILTER_OPTIONS = [
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

// Options for the Create Method filter - shared by the toolbar Select below and the Create Method
// column's own header filter, both of which read/write the same `columnFilters` 'createMethod' entry. See
// createMethodWhere in query.forOrganizationTable.handler.ts for how each category maps to
// source/creatorHadDpAccess. 'internal' unions suggested-with-access and data-portal-added - both mean "not
// actually the public." No "All" entry - both widgets are `clearable`, which is the plain-filter
// equivalent; the toolbar widget shows "All" as a placeholder (see its `placeholder` prop below) rather
// than a real, selectable value.
const CREATE_METHOD_OPTIONS = [
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

export interface OrganizationTableProps {
	/**
	 * Restricts this same table to orgs needing the location-phone display-fix cleanup pass (see
	 * `needsLocationPhoneCleanup` in query.forOrganizationTable.schema.ts) - the "Location Phone Cleanup"
	 * data-portal page renders the table this way instead of duplicating its columns/sorting/pagination into a
	 * separate component. All the usual filters (status, search, etc.) still work on top of this restriction.
	 * Temporary: safe to delete this prop, along with the schema/handler field it maps to, once that page's
	 * review is done.
	 */
	locationPhoneCleanupOnly?: boolean
}

/**
 * The org directory's system-of-record table - publish status, verification date, deletion flag, and each
 * org's locations. Filtering, sorting, and pagination all run server-side (`forOrganizationTable`).
 */
export const OrganizationTable = ({ locationPhoneCleanupOnly }: OrganizationTableProps = {}) => {
	const variants = useCustomVariant()
	const theme = useMantineTheme()

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'deleted', value: false }])
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })
	// Status and Create Method are always shown; every other filter (including Deleted) is added/removed as
	// needed via the toolbar's "+ Filter" menu, genuinely opt-in - none start active. Hiding deleted orgs by
	// default is still a real, separate behavior (see `columnFilters`' own initial value above); it just
	// isn't a visible widget until someone deliberately wants to change it.
	const [activeFacets, setActiveFacets] = useState<AddableFacetId[]>([])
	// Controlled column visibility (see DataTable's own `columnVisibility` prop) - every facet below except
	// Deleted has a matching table column (same id), hidden by default and only shown once that facet is
	// actually in use, so the table doesn't open with five empty pill columns nobody asked for. Must list
	// every column elsewhere marked `hiddenByDefault: true` (currently 'id' and 'createMethod' too), not
	// just these five - passing a controlled value here replaces DataTable's own default entirely.
	const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
		id: false,
		createMethod: false,
		community: false,
		leaderBadge: false,
		serviceTags: false,
		serviceAttributes: false,
		remoteOptions: false,
	})

	// Matches ZStatusFilter in query.forOrganizationTable.schema.ts - multi-select, so several chosen
	// values union (OR); this only filters which orgs show up, never sets more than one status on an org.
	const statusFilter = columnFilters.find(({ id }) => id === 'status')?.value as TStatusFilter[] | undefined
	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const createMethodFilter = columnFilters.find(({ id }) => id === 'createMethod')?.value as
		'public' | 'internal' | undefined
	const createdByFilter = columnFilters.find(({ id }) => id === 'createdBy')?.value as
		{ id: string; label: string }[] | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	// Shared get/set helpers for the five metadata quick filters below (Community, Leader Badge, Service
	// Tags, Service Attributes, Remote Options) - all just a `string[]` stored directly under their own
	// columnFilters key, the same toolbar-quick-filter pattern Status/Create Method already use. Multiple
	// selected values always match with OR ("any") semantics now - the toolbar used to expose an "all"
	// (AND) toggle too, but it was removed as confusing. The API's own optional `*MatchMode` params
	// (still 'any' by default when omitted) are untouched, in case this comes back.
	const getArrayFilter = (id: string): string[] =>
		(columnFilters.find((f) => f.id === id)?.value as string[] | undefined) ?? []
	const setArrayFilter = (id: string) => (next: string[]) => {
		setColumnFilters((prev) => {
			const rest = prev.filter((f) => f.id !== id)
			return next.length ? [...rest, { id, value: next }] : rest
		})
	}

	const addFacet = (id: AddableFacetId) => {
		setActiveFacets((prev) => [...prev, id])
		// 'deleted' has no matching column (see the columnVisibility comment above) - nothing to reveal.
		if (id !== 'deleted') {
			setColumnVisibility((prev) => ({ ...prev, [id]: true }))
		}
	}
	// Removing a facet both hides its widget and clears whatever value it held - otherwise re-adding it
	// later would resurface a stale filter the person never meant to keep applying. Also re-hides its
	// column, so a filter that's no longer active doesn't leave a pill column behind with nothing driving it.
	const removeFacet = (id: AddableFacetId) => {
		setActiveFacets((prev) => prev.filter((f) => f !== id))
		if (id !== 'deleted') {
			setColumnVisibility((prev) => ({ ...prev, [id]: false }))
		}
		switch (id) {
			case 'deleted': {
				setColumnFilters((prev) => prev.filter((f) => f.id !== 'deleted'))
				break
			}
			case 'community': {
				setArrayFilter('communityAttributeIds')([])
				break
			}
			case 'leaderBadge': {
				setArrayFilter('leaderAttributeIds')([])
				break
			}
			case 'serviceTags': {
				setArrayFilter('serviceTagIds')([])
				break
			}
			case 'serviceAttributes': {
				setArrayFilter('serviceAttributeIds')([])
				break
			}
			case 'remoteOptions': {
				setArrayFilter('remoteOptions')([])
				break
			}
		}
	}

	const communityFilter = getArrayFilter('communityAttributeIds')
	const leaderFilter = getArrayFilter('leaderAttributeIds')
	const serviceTagFilter = getArrayFilter('serviceTagIds')
	const serviceAttributeFilter = getArrayFilter('serviceAttributeIds')
	const remoteOptionsFilter = getArrayFilter('remoteOptions')

	const { data: communityOptions, isLoading: communityLoading } = api.organization.badgeOptions.useQuery({
		badgeType: 'service-focus',
	})
	const { data: leaderOptions, isLoading: leaderLoading } = api.organization.badgeOptions.useQuery({
		badgeType: 'organization-leadership',
	})
	const { data: serviceTagCategories, isLoading: serviceTagsLoading } = api.component.ServiceSelect.useQuery()
	const { data: serviceAttributeRows, isLoading: serviceAttributesLoading } =
		api.fieldOpt.attributesForFilter.useQuery({ canAttachTo: ['SERVICE'] })

	// Same parent -> child shape for both (see organization.badgeOptions) - only the category tag differs.
	// Plain `name` fields throughout this file rather than translated labels - the data portal is
	// staff-only and doesn't localize. A top-level attribute with no children is itself a real, directly
	// selectable value (matches the org-edit Community Focus picker's own plain-checkbox treatment for
	// childless items) - rendered as a flat, ungrouped option rather than a one-item group with a
	// redundant repeated label. One WITH children is `cascadable`: its own id is never selectable, only
	// its children are, via the synthetic "All X" row GroupedMultiSelect adds for cascadable groups.
	const toBadgeGroups = useCallback(
		(options: typeof communityOptions): GroupedMultiSelectGroup[] =>
			(options ?? []).map((attribute) =>
				attribute.children.length === 0
					? { id: attribute.id, label: '', items: [{ id: attribute.id, label: attribute.name }] }
					: {
							id: attribute.id,
							label: attribute.name,
							items: attribute.children.map((child) => ({ id: child.id, label: child.name })),
							cascadable: true,
						}
			),
		[]
	)
	const communityGroups = useMemo(() => toBadgeGroups(communityOptions), [toBadgeGroups, communityOptions])
	const leaderGroups = useMemo(() => toBadgeGroups(leaderOptions), [toBadgeGroups, leaderOptions])

	// id -> name, for the Community/Leader Badge table columns' pill cells - both read the org's own shared
	// `attributeIds` field (see createPillListCell), so each column's map only needs to cover its own
	// category's ids to naturally exclude the other's.
	const idsToLabelMap = useCallback((options: typeof communityOptions): Map<string, string> => {
		const map = new Map<string, string>()
		for (const attribute of options ?? []) {
			map.set(attribute.id, attribute.name)
			for (const child of attribute.children) {
				map.set(child.id, child.name)
			}
		}
		return map
	}, [])
	const communityLabelById = useMemo(() => idsToLabelMap(communityOptions), [idsToLabelMap, communityOptions])
	const leaderLabelById = useMemo(() => idsToLabelMap(leaderOptions), [idsToLabelMap, leaderOptions])

	const serviceTagGroups = useMemo<GroupedMultiSelectGroup[]>(
		() =>
			(serviceTagCategories ?? [])
				.filter((category) => category.services.length > 0)
				.map((category) => ({
					id: category.tsKey,
					// `category` is a raw slug (e.g. "legal-aid") - there's no plain display-name field on
					// ServiceCategory, only this slug or a translated tsKey, and translation isn't used here.
					label: formatSlugLabel(category.category),
					items: category.services.map((tag) => ({ id: tag.id, label: tag.name })),
					// Matches the public search's "Filter by Service" behavior (a separate "All [Category]"
					// checkbox, distinct from editing's plain non-interactive category grouping).
					cascadable: true,
				})),
		[serviceTagCategories]
	)

	// No `cascadable` here - neither service-attribute editing nor any public-facing filter has a "select
	// all in this category" precedent for plain attributes, unlike Community/Leader Badge/Service Tags.
	const serviceAttributeGroups = useMemo<GroupedMultiSelectGroup[]>(() => {
		const byCategory = new Map<string, GroupedMultiSelectGroup>()
		for (const row of serviceAttributeRows ?? []) {
			const group = byCategory.get(row.categoryId) ?? {
				id: row.categoryId,
				label: row.categoryName,
				items: [],
			}
			group.items.push({ id: row.attributeId, label: row.attributeName })
			byCategory.set(row.categoryId, group)
		}
		return [...byCategory.values()]
	}, [serviceAttributeRows])

	// id -> name, for the Service Tags/Service Attributes table columns' pill cells.
	const serviceTagLabelById = useMemo(() => {
		const map = new Map<string, string>()
		for (const category of serviceTagCategories ?? []) {
			for (const tag of category.services) {
				map.set(tag.id, tag.name)
			}
		}
		return map
	}, [serviceTagCategories])
	const serviceAttributeLabelById = useMemo(() => {
		const map = new Map<string, string>()
		for (const row of serviceAttributeRows ?? []) {
			map.set(row.attributeId, row.attributeName)
		}
		return map
	}, [serviceAttributeRows])

	// The Community/Leader Badge/Service Tags/Service Attributes/Remote Options quick filters are toolbar
	// widgets with no `filter` of their own on any column - DataTable's own "applied filters" summary can
	// only build an entry from a `columns[]` definition's `filter`, so these need to hand their own
	// label/value text in directly. Each does have its own (hidden-by-default) display column, just with no
	// filter UI attached to it - the toolbar widget above is that column's only filter control.
	const toolbarFilterSummary = useMemo(() => {
		const entries: { id: string; label: string; valueLabel: string }[] = []
		if (communityFilter.length) {
			entries.push({
				id: 'communityAttributeIds',
				label: 'Community',
				valueLabel: labelsForSelection(communityGroups, communityFilter).join(', '),
			})
		}
		if (leaderFilter.length) {
			entries.push({
				id: 'leaderAttributeIds',
				label: 'Leader Badge',
				valueLabel: labelsForSelection(leaderGroups, leaderFilter).join(', '),
			})
		}
		if (serviceTagFilter.length) {
			entries.push({
				id: 'serviceTagIds',
				label: 'Service Tags',
				valueLabel: labelsForSelection(serviceTagGroups, serviceTagFilter).join(', '),
			})
		}
		if (serviceAttributeFilter.length) {
			entries.push({
				id: 'serviceAttributeIds',
				label: 'Service Attributes',
				valueLabel: labelsForSelection(serviceAttributeGroups, serviceAttributeFilter).join(', '),
			})
		}
		if (remoteOptionsFilter.length) {
			entries.push({
				id: 'remoteOptions',
				label: 'Remote Options',
				valueLabel: labelsForSelection(REMOTE_OPTION_GROUPS, remoteOptionsFilter).join(', '),
			})
		}
		return entries
	}, [
		communityFilter,
		communityGroups,
		leaderFilter,
		leaderGroups,
		serviceTagFilter,
		serviceTagGroups,
		serviceAttributeFilter,
		serviceAttributeGroups,
		remoteOptionsFilter,
	])

	const { data, isLoading, isError, isFetching } = api.organization.forOrganizationTable.useQuery(
		{
			status: statusFilter,
			deleted: deletedFilter,
			createMethod: createMethodFilter,
			createdByUserIds: createdByFilter?.map((person) => person.id),
			communityAttributeIds: communityFilter.length ? communityFilter : undefined,
			leaderAttributeIds: leaderFilter.length ? leaderFilter : undefined,
			serviceTagIds: serviceTagFilter.length ? serviceTagFilter : undefined,
			serviceAttributeIds: serviceAttributeFilter.length ? serviceAttributeFilter : undefined,
			remoteOptions: remoteOptionsFilter.length ? (remoteOptionsFilter as TRemoteOption[]) : undefined,
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
			needsLocationPhoneCleanup: locationPhoneCleanupOnly || undefined,
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
				// old hidden 'published' column entirely. Also filterable directly from this column's own
				// header icon, not just the toolbar's Status dropdown below - both write the same
				// `columnFilters` entry, so either one stays in sync with the other.
				id: 'status',
				header: 'Status',
				size: 160,
				enableSorting: false,
				filter: { type: 'multi-select', options: STATUS_FILTER_OPTIONS },
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
				id: 'createdBy',
				header: 'Created By',
				size: 200,
				enableSorting: false,
				accessorFn: (row) => {
					const creator = (row as RowItem).suggestions?.[0]?.suggestedBy
					return creator?.name || creator?.email || ''
				},
				filter: { type: 'user-search' },
				cell: CreatedByCell,
			},
			{
				// Hidden by default (see the Show/Hide Columns menu) since the toolbar dropdown already
				// covers this at a glance for most people - but once shown, this column's own header filter
				// icon works too, writing the same `columnFilters` entry as the toolbar control below.
				id: 'createMethod',
				header: 'Create Method',
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				filter: { type: 'select', options: CREATE_METHOD_OPTIONS },
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
			{
				id: 'community',
				header: 'Community',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: createPillListCell({ getIds: (row) => row.attributeIds, labelById: communityLabelById }),
			},
			{
				id: 'leaderBadge',
				header: 'Leader Badge',
				size: 180,
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: createPillListCell({ getIds: (row) => row.attributeIds, labelById: leaderLabelById }),
			},
			{
				id: 'serviceTags',
				header: 'Service Tags',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: createPillListCell({ getIds: (row) => row.serviceIds, labelById: serviceTagLabelById }),
			},
			{
				id: 'serviceAttributes',
				header: 'Service Attributes',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: createPillListCell({
					getIds: (row) => row.serviceAttributeIds,
					labelById: serviceAttributeLabelById,
				}),
			},
			{
				id: 'remoteOptions',
				header: 'Remote Options',
				size: 200,
				hiddenByDefault: true,
				enableSorting: false,
				enableGlobalFilter: false,
				accessorFn: () => undefined,
				cell: createPillListCell({
					getIds: (row) => row.remoteOptions,
					labelById: REMOTE_OPTION_LABEL_BY_ID,
				}),
			},
		],
		[variants, theme, communityLabelById, leaderLabelById, serviceTagLabelById, serviceAttributeLabelById]
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
				columnVisibility={columnVisibility}
				onColumnVisibilityChange={setColumnVisibility}
				toolbarFilterSummary={toolbarFilterSummary}
				toolbarExtra={
					<Stack gap='xs' w='100%'>
						<Group gap='xs' wrap='nowrap' justify='flex-end'>
							<MultiSelect
								size='xs'
								label='Status'
								placeholder='All'
								styles={COMPACT_MULTISELECT_STYLES}
								data={STATUS_FILTER_OPTIONS}
								value={statusFilter ?? []}
								onChange={(next) => {
									setColumnFilters((prev) => {
										const rest = prev.filter(({ id }) => id !== 'status')
										return next.length ? [...rest, { id: 'status', value: next }] : rest
									})
								}}
								renderPill={renderStatusPill}
								clearable
								w={190}
							/>
							<Select
								size='xs'
								label={<CreateMethodLabel />}
								placeholder='All'
								styles={COMPACT_SELECT_STYLES}
								data={CREATE_METHOD_OPTIONS}
								value={createMethodFilter ?? null}
								onChange={(next) => {
									setColumnFilters((prev) => {
										const rest = prev.filter(({ id }) => id !== 'createMethod')
										return next === 'public' || next === 'internal'
											? [...rest, { id: 'createMethod', value: next }]
											: rest
									})
								}}
								clearable
								w={110}
							/>
						</Group>
						{/* Deleted and the metadata quick filters are all added/removed via "+ Filter" - a second
						row, right-aligned, keeps them visually distinct from the always-on Status/Create Method
						row above instead of blending into one long left-to-right line. */}
						<Group gap='xs' wrap='wrap' justify='flex-end'>
							{activeFacets.includes('deleted') && (
								<FilterChip
									label='Deleted'
									summary={
										DELETED_FILTER_OPTIONS.find((o) => o.value === deletedFilterToValue(deletedFilter))?.label
									}
									onRemove={() => removeFacet('deleted')}
								>
									<Select
										size='xs'
										styles={COMPACT_SELECT_STYLES}
										data={DELETED_FILTER_OPTIONS}
										value={deletedFilterToValue(deletedFilter)}
										onChange={(next) => {
											setColumnFilters((prev) => {
												const rest = prev.filter(({ id }) => id !== 'deleted')
												const filterValue = deletedValueToFilter(next)
												return filterValue === undefined
													? rest
													: [...rest, { id: 'deleted', value: filterValue }]
											})
										}}
										allowDeselect={false}
										w={150}
									/>
								</FilterChip>
							)}
							{activeFacets.includes('community') && (
								<FilterChip
									label='Community'
									summary={communityFilter.length ? `${communityFilter.length} selected` : undefined}
									onRemove={() => removeFacet('community')}
								>
									<GroupedMultiSelect
										label='Community'
										groups={communityGroups}
										isLoading={communityLoading}
										value={communityFilter}
										onChange={setArrayFilter('communityAttributeIds')}
									/>
								</FilterChip>
							)}
							{activeFacets.includes('leaderBadge') && (
								<FilterChip
									label='Leader Badge'
									summary={leaderFilter.length ? `${leaderFilter.length} selected` : undefined}
									onRemove={() => removeFacet('leaderBadge')}
								>
									<GroupedMultiSelect
										label='Leader Badge'
										groups={leaderGroups}
										isLoading={leaderLoading}
										value={leaderFilter}
										onChange={setArrayFilter('leaderAttributeIds')}
									/>
								</FilterChip>
							)}
							{activeFacets.includes('serviceTags') && (
								<FilterChip
									label='Service Tags'
									summary={serviceTagFilter.length ? `${serviceTagFilter.length} selected` : undefined}
									onRemove={() => removeFacet('serviceTags')}
								>
									<GroupedMultiSelect
										label='Service Tags'
										groups={serviceTagGroups}
										isLoading={serviceTagsLoading}
										value={serviceTagFilter}
										onChange={setArrayFilter('serviceTagIds')}
									/>
								</FilterChip>
							)}
							{activeFacets.includes('serviceAttributes') && (
								<FilterChip
									label='Service Attributes'
									summary={
										serviceAttributeFilter.length ? `${serviceAttributeFilter.length} selected` : undefined
									}
									onRemove={() => removeFacet('serviceAttributes')}
								>
									<GroupedMultiSelect
										label='Service Attributes'
										groups={serviceAttributeGroups}
										isLoading={serviceAttributesLoading}
										value={serviceAttributeFilter}
										onChange={setArrayFilter('serviceAttributeIds')}
									/>
								</FilterChip>
							)}
							{activeFacets.includes('remoteOptions') && (
								<FilterChip
									label='Remote Options'
									summary={remoteOptionsFilter.length ? `${remoteOptionsFilter.length} selected` : undefined}
									onRemove={() => removeFacet('remoteOptions')}
								>
									<GroupedMultiSelect
										label='Remote Options'
										groups={REMOTE_OPTION_GROUPS}
										value={remoteOptionsFilter}
										onChange={setArrayFilter('remoteOptions')}
									/>
								</FilterChip>
							)}
							<Menu closeOnItemClick position='bottom-start'>
								<Menu.Target>
									<Tooltip label='Add filter'>
										<ActionIcon variant='subtle' aria-label='Add filter'>
											<Icon icon='carbon:add' />
										</ActionIcon>
									</Tooltip>
								</Menu.Target>
								<Menu.Dropdown>
									{ADDABLE_FACETS.filter((facet) => !activeFacets.includes(facet.id)).map((facet) => (
										<Menu.Item key={facet.id} onClick={() => addFacet(facet.id)}>
											{facet.label}
										</Menu.Item>
									))}
									{ADDABLE_FACETS.every((facet) => activeFacets.includes(facet.id)) && (
										<Menu.Item disabled>All filters added</Menu.Item>
									)}
								</Menu.Dropdown>
							</Menu>
						</Group>
					</Stack>
				}
			/>
		</Stack>
	)
}
