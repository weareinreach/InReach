import {
	ActionIcon,
	Badge,
	Button,
	Checkbox,
	type ComboboxRenderPillInput,
	Fieldset,
	Group,
	Modal,
	MultiSelect,
	Pill,
	Popover,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { keepPreviousData } from '@tanstack/react-query'
import {
	type ColumnFiltersState,
	type ExpandedState,
	type PaginationState,
	type RowSelectionState,
} from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next/pages'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { type TReplaceTextItem } from '@weareinreach/api/router/bulkSearchReplace/mutation.replaceText.schema'
import {
	type TBulkSearchReplaceScope,
	type TMatchField,
} from '@weareinreach/api/router/bulkSearchReplace/query.search.schema'
import { ORG_UNPUBLISHED_REASON_LABELS } from '@weareinreach/db/enums/labels'
import { Link } from '~ui/components/core/Link'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'
import { TableToolbarToggle } from './TableToolbarToggle'

type OrgRow = ApiOutput['bulkSearchReplace']['search']['results'][number]
type ServiceRow = OrgRow['services'][number]
/** A rendered row is either a top-level org or one of its matching services, expanded under it. */
type TableRow = OrgRow | ServiceRow

const FIELD_LABELS: Record<TMatchField, string> = {
	orgName: 'Org name',
	orgDescription: 'Org description',
	serviceName: 'Service name',
	serviceDescription: 'Service description',
	serviceAttributes: 'Service attributes',
	serviceTags: 'Service tags',
}

/**
 * Only these can be rewritten by Replace All - see mutation.replaceText.schema.ts for why Org Name and the
 * two taxonomy fields (attributes/tags) are excluded.
 */
const isTextEligible = (matches: TMatchField[]) =>
	matches.includes('orgDescription') ||
	matches.includes('serviceName') ||
	matches.includes('serviceDescription')

const getSubRows = (row: TableRow): TableRow[] | undefined =>
	(row as OrgRow).services as TableRow[] | undefined
const getRowId = (row: TableRow) => row.id

/** Wraps every case-insensitive occurrence of `term` in `text` with a `<mark>`. */
const HighlightedText = ({ text, term }: { text: string; term: string }) => {
	if (!term) return <>{text}</>
	const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const parts = text.split(new RegExp(`(${escaped})`, 'ig'))
	return (
		<>
			{parts.map((part, index) =>
				part.toLowerCase() === term.toLowerCase() ? (
					<mark key={index}>{part}</mark>
				) : (
					<Fragment key={index}>{part}</Fragment>
				)
			)}
		</>
	)
}

interface MatchesCellProps extends DataTableCellContext<TableRow> {
	searchTerm: string
}

/** One line per matched field, not just the first - closer to a find-in-files result than a single snippet. */
const MatchesCell = ({ row, searchTerm }: MatchesCellProps) => {
	if (!row.matches.length) return null
	return (
		<Stack gap={2}>
			{row.matches.map((field) => {
				const value =
					field === 'orgName' || field === 'serviceName'
						? row.name
						: field === 'orgDescription' || field === 'serviceDescription'
							? ((row as OrgRow | ServiceRow).description ?? '')
							: null
				return (
					<Text key={field} size='sm'>
						<Text span fw={600} c='dimmed' size='xs' tt='uppercase'>
							{FIELD_LABELS[field]}:{' '}
						</Text>
						{value ? (
							<HighlightedText text={value} term={searchTerm} />
						) : (
							<Text span c='dimmed'>
								(attribute/tag label match)
							</Text>
						)}
					</Text>
				)
			})}
		</Stack>
	)
}

/**
 * Org rows show lastVerified; services have no such field - blank now that Updated has its own column
 * (previously showed updatedAt here as a stand-in, which is now redundant).
 */
const VerifiedCell = ({ row, depth }: DataTableCellContext<TableRow>) => {
	if (depth !== 0) return null
	const org = row as OrgRow
	return <Text size='sm'>{org.lastVerified ? new Date(org.lastVerified).toLocaleDateString() : 'Never'}</Text>
}

/**
 * Cell renderer shared by the 'updatedAt' and 'createdAt' columns - same Luxon formatting as
 * OrganizationTable's own DateCell.
 */
const DateCell = ({ value }: DataTableCellContext<TableRow>) => {
	if (!value) return null
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

/**
 * Org rows: same derivation as OrganizationTable's Status column. Service rows have no unpublished-reason
 * enum - just the plain `published` boolean.
 */
const StatusCell = ({ row, depth }: DataTableCellContext<TableRow>) => {
	if (depth === 0) {
		const org = row as OrgRow
		if (org.published) return <Text size='sm'>Published</Text>
		return (
			<Text size='sm'>
				{org.unpublishedReason ? ORG_UNPUBLISHED_REASON_LABELS[org.unpublishedReason] : ''}
			</Text>
		)
	}
	const svc = row as ServiceRow
	return <Text size='sm'>{svc.published ? 'Published' : 'Unpublished'}</Text>
}

interface NameLookupCellProps extends DataTableCellContext<TableRow> {
	ids: (row: ServiceRow) => string[]
	labelFor: (id: string) => string | undefined
}

/**
 * Shared renderer for the Service Tags / Attributes columns - service rows resolve their id array through the
 * passed-in lookup map; org rows render blank (orgs don't carry service-level tags/attributes).
 */
const NameLookupCell = ({ row, depth, ids, labelFor }: NameLookupCellProps) => {
	if (depth === 0) return null
	const labels = ids(row as ServiceRow)
		.map((id) => labelFor(id))
		.filter((label): label is string => Boolean(label))
	if (!labels.length) return null
	return (
		<Group gap={4} wrap='wrap'>
			{labels.map((label) => (
				<Badge key={label} size='xs' variant='light' color='gray'>
					{label}
				</Badge>
			))}
		</Group>
	)
}

interface EditPopoverProps {
	row: TableRow
	depth: number
	organizationId?: string
	onSaved: () => void
}

/**
 * Quick edit - a plain inline form, not an always-editable cell. Reuses the same single-record mutations the
 * normal org/service edit pages already call; this button grants no access beyond what those pages already
 * offer a dataPortalBasic session.
 */
const EditPopover = ({ row, depth, organizationId, onSaved }: EditPopoverProps) => {
	const theme = useMantineTheme()
	const [opened, { open, close }] = useDisclosure(false)
	const [name, setName] = useState(row.name)
	const [description, setDescription] = useState((row as OrgRow | ServiceRow).description ?? '')

	const updateOrg = api.organization.updateBasic.useMutation({ onSuccess: onSaved })
	const updateService = api.service.upsert.useMutation({ onSuccess: onSaved })
	const isPending = updateOrg.isPending || updateService.isPending

	const handleOpen = () => {
		setName(row.name)
		setDescription((row as OrgRow | ServiceRow).description ?? '')
		open()
	}

	const handleSave = () => {
		if (depth === 0) {
			updateOrg.mutate({ id: row.id, name, description }, { onSuccess: () => close() })
		} else if (organizationId) {
			updateService.mutate({ id: row.id, organizationId, name, description }, { onSuccess: () => close() })
		}
	}

	return (
		<Popover
			opened={opened}
			onChange={(next) => (next ? handleOpen() : close())}
			position='bottom-end'
			withArrow
			shadow='md'
		>
			<Popover.Target>
				<Tooltip label='Quick edit'>
					<ActionIcon variant='subtle' onClick={handleOpen} aria-label='Quick edit'>
						<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			</Popover.Target>
			<Popover.Dropdown miw={320}>
				<Stack gap={8}>
					{depth === 0 ? null : (
						<TextInput label='Name' size='xs' value={name} onChange={(e) => setName(e.currentTarget.value)} />
					)}
					<Textarea
						label='Description'
						size='xs'
						minRows={3}
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
					/>
					<Group justify='flex-end' gap={8}>
						<Button size='xs' variant='subtle' onClick={close}>
							Cancel
						</Button>
						<Button size='xs' loading={isPending} onClick={handleSave}>
							Save
						</Button>
					</Group>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	)
}

/**
 * Full edit - navigates to the record's real edit page, mirroring OrganizationTable's `RowAction` pattern
 * (`ActionIcon` + `Link` + `target='_blank'`, themed `allyGreen`). Org rows use a typed `Route` (no extra
 * query params needed, same as OrganizationTable's own edit link); service rows need an extra `serviceId`
 * param nextjs-routes' generated `Route` type doesn't allow on a typed object, so those build a plain string
 * href instead - `serviceId` lets the destination page auto-open this specific service's drawer (see
 * ServiceEditDrawer's `autoOpen` prop).
 */
const FullEditLink = ({ row, depth, parentRow }: DataTableCellContext<TableRow>) => {
	const theme = useMantineTheme()

	if (depth === 0) {
		return (
			<Tooltip label='Open full edit page'>
				<ActionIcon
					variant='subtle'
					component={Link}
					href={{ pathname: '/org/[slug]/edit', query: { slug: (row as OrgRow).slug } }}
					target='_blank'
					aria-label='Open full edit page'
				>
					<Icon icon='carbon:launch' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		)
	}

	const svc = row as ServiceRow
	const parentSlug = (parentRow as OrgRow | undefined)?.slug
	if (!parentSlug) return null
	// `?serviceId=` isn't expressible on nextjs-routes' generated typed Route object (it only knows the
	// path's own dynamic segments), so this one link is a plain string href through a native anchor
	// (`component='a'`) rather than the typed `Link` wrapper - `serviceId` lets the destination page
	// auto-open this specific service's drawer (see ServiceEditDrawer's `autoOpen` prop).
	const href = svc.orgLocationId
		? `/org/${parentSlug}/${svc.orgLocationId}/edit?serviceId=${svc.id}`
		: `/org/${parentSlug}/remote/edit?serviceId=${svc.id}`

	return (
		<Tooltip label='Open full edit page'>
			<ActionIcon variant='subtle' component='a' href={href} target='_blank' aria-label='Open full edit page'>
				<Icon icon='carbon:launch' color={theme.other.colors.primary.allyGreen} />
			</ActionIcon>
		</Tooltip>
	)
}

const ActionsCell = (ctx: DataTableCellContext<TableRow>) => {
	const { row, depth, parentRow } = ctx
	return (
		<Group wrap='nowrap' gap={8}>
			<EditPopover
				row={row}
				depth={depth}
				organizationId={depth > 0 ? (parentRow as OrgRow | undefined)?.id : undefined}
				onSaved={() => undefined}
			/>
			<FullEditLink {...ctx} />
		</Group>
	)
}

const DEFAULT_SCOPE: TBulkSearchReplaceScope = {
	orgName: true,
	orgDescription: true,
	serviceName: true,
	serviceDescription: true,
	serviceAttributes: false,
	serviceTags: false,
}

interface BulkTarget {
	kind: 'attribute' | 'tag'
	id: string
	label: string
}

type PreviewStatus = 'already-has' | 'will-add' | 'will-remove' | 'no-change'

const PREVIEW_STATUS_LABEL: Record<PreviewStatus, string> = {
	'already-has': 'Already has it',
	'will-add': 'Will add',
	'will-remove': 'Will remove',
	'no-change': "No change (doesn't have it)",
}
const PREVIEW_STATUS_COLOR: Record<PreviewStatus, string> = {
	'already-has': 'gray',
	'will-add': 'green',
	'will-remove': 'red',
	'no-change': 'gray',
}

/**
 * Add/Remove Tag or Attribute dialog - only service-level rows are eligible; org rows in the current
 * selection are called out, not silently ignored. Preview is computed client-side from each selected
 * service's already-loaded attributeIds/tagIds (no extra round-trip).
 */
const BulkEditDialog = ({
	opened,
	onClose,
	selectedServices,
	ignoredOrgCount,
	onDone,
}: {
	opened: boolean
	onClose: () => void
	selectedServices: ServiceRow[]
	ignoredOrgCount: number
	onDone: () => void
}) => {
	const { t: tAttr } = useTranslation(['attribute', 'common'])
	const { t: tSvc } = useTranslation('services')
	const [action, setAction] = useState<'add' | 'remove'>('add')
	const [target, setTarget] = useState<BulkTarget | null>(null)

	const { data: attributesByCategory } = api.fieldOpt.attributesByCategory.useQuery({
		canAttachTo: ['SERVICE'],
		attributeActive: true,
	})
	const { data: tagCategories } = api.component.ServiceSelect.useQuery()

	const eligibleAttributes = (attributesByCategory ?? []).filter(
		(a) => !a.requireText && !a.requireBoolean && !a.requireData && !a.requireLanguage && !a.requireGeo
	)

	const bulkAttachTags = api.service.bulkAttachTags.useMutation()
	const bulkDetachTags = api.service.bulkDetachTags.useMutation()
	const bulkAttachAttribute = api.service.bulkAttachAttribute.useMutation()
	const bulkDetachAttribute = api.service.bulkDetachAttribute.useMutation()
	const isPending =
		bulkAttachTags.isPending ||
		bulkDetachTags.isPending ||
		bulkAttachAttribute.isPending ||
		bulkDetachAttribute.isPending

	const preview = target
		? selectedServices.map((svc) => {
				const currentIds = target.kind === 'attribute' ? svc.attributeIds : svc.tagIds
				const hasIt = currentIds.includes(target.id)
				const status: PreviewStatus =
					action === 'add' ? (hasIt ? 'already-has' : 'will-add') : hasIt ? 'will-remove' : 'no-change'
				return { id: svc.id, name: svc.name, status }
			})
		: []

	const handleApply = () => {
		if (!target) return
		const serviceIds = selectedServices.map((svc) => svc.id)
		const onSuccess = (result: { added: number; alreadyHad: number } | { removed: number }) => {
			const message =
				'added' in result
					? `Added to ${result.added} service(s); ${result.alreadyHad} already had it.`
					: `Removed from ${result.removed} service(s).`
			showNotification({ message, autoClose: 6000 })
			onDone()
		}
		if (target.kind === 'tag') {
			if (action === 'add') {
				bulkAttachTags.mutate({ serviceIds, tagId: target.id }, { onSuccess })
			} else {
				bulkDetachTags.mutate({ serviceIds, tagId: target.id }, { onSuccess })
			}
		} else if (action === 'add') {
			bulkAttachAttribute.mutate({ serviceIds, attributeId: target.id }, { onSuccess })
		} else {
			bulkDetachAttribute.mutate({ serviceIds, attributeId: target.id }, { onSuccess })
		}
	}

	return (
		<Modal opened={opened} onClose={onClose} title='Add / remove tag or attribute' size='md'>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{selectedServices.length} service(s) selected
					{ignoredOrgCount > 0
						? ` — ${ignoredOrgCount} organization(s) in your selection will be ignored for this action.`
						: '.'}
				</Text>
				<Group grow>
					<Select
						label='Action'
						data={[
							{ value: 'add', label: 'Add' },
							{ value: 'remove', label: 'Remove' },
						]}
						value={action}
						onChange={(v) => v && setAction(v as 'add' | 'remove')}
						allowDeselect={false}
					/>
					<Select
						label='Attribute or tag'
						placeholder='Choose a value'
						data={[
							{
								group: 'Attributes',
								items: eligibleAttributes.map((a) => ({
									value: `attribute:${a.attributeId}`,
									label: tAttr(a.attributeKey),
								})),
							},
							{
								group: 'Service tags',
								items: (tagCategories ?? []).flatMap((cat) =>
									cat.services.map((tag) => ({ value: `tag:${tag.id}`, label: tSvc(tag.tsKey) }))
								),
							},
						]}
						value={target ? `${target.kind}:${target.id}` : null}
						onChange={(v) => {
							if (!v) {
								setTarget(null)
								return
							}
							const [kind, id] = v.split(':')
							const label =
								kind === 'attribute'
									? eligibleAttributes.find((a) => a.attributeId === id)
										? tAttr(eligibleAttributes.find((a) => a.attributeId === id)!.attributeKey)
										: ''
									: (tagCategories ?? []).flatMap((c) => c.services).find((t) => t.id === id)
										? tSvc((tagCategories ?? []).flatMap((c) => c.services).find((t) => t.id === id)!.tsKey)
										: ''
							setTarget({ kind: kind as 'attribute' | 'tag', id: id ?? '', label })
						}}
					/>
				</Group>
				{target && (
					<Stack gap={4}>
						<Text size='xs' fw={700} c='dimmed' tt='uppercase'>
							Preview
						</Text>
						{preview.map((row) => (
							<Group key={row.id} justify='space-between' gap={8} wrap='nowrap'>
								<Text size='sm' truncate>
									{row.name}
								</Text>
								<Badge size='sm' variant='light' color={PREVIEW_STATUS_COLOR[row.status]}>
									{PREVIEW_STATUS_LABEL[row.status]}
								</Badge>
							</Group>
						))}
					</Stack>
				)}
				<Group justify='flex-end' gap={8}>
					<Button variant='subtle' onClick={onClose}>
						Cancel
					</Button>
					<Button
						loading={isPending}
						disabled={!target || selectedServices.length === 0}
						onClick={handleApply}
					>
						Apply
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}

/**
 * Same pill renderer as OrganizationTable's Status MultiSelect - see that file's comment for why the remove
 * button's icon/size need overriding. Generic (not status-specific) since it's shared by the Service Tags and
 * Attributes toolbar filters below.
 */
const renderFilterPill = ({ option, onRemove }: ComboboxRenderPillInput) => (
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

// Same as OrganizationTable's COMPACT_MULTISELECT_STYLES - see that file's comment for why `height: 'auto'`
// is needed to escape the app-wide fixed-height Input override.
const COMPACT_MULTISELECT_STYLES = {
	input: { height: 'auto', minHeight: 30, fontSize: 'var(--mantine-font-size-xs)', padding: '2px 8px' },
	label: { fontSize: 'var(--mantine-font-size-xs)' },
	pill: { fontSize: 'var(--mantine-font-size-xs)' },
}

const deletedFilterLabel = (state: boolean | undefined): string => {
	if (state) return 'Show all'
	if (state === undefined) return 'Hide deleted'
	return 'Show deleted'
}
const deletedFilterIcon = (): string => 'carbon:trash-can'
const isDeletedFilterExcluded = (state: boolean | undefined): boolean => state === false

/**
 * Bulk Search & Replace's results table - search organization/service names, descriptions, attributes, and
 * tags; edit a record inline; find-and-replace with a per-row review; or bulk-add/remove a service tag or
 * attribute across a selected set. See docs/DataPortal/Organizations/bulk-search-replace.md.
 */
export const BulkSearchReplaceTable = () => {
	const [searchText, setSearchText] = useState('')
	const [replaceText, setReplaceText] = useState('')
	const [scope, setScope] = useState<TBulkSearchReplaceScope>(DEFAULT_SCOPE)
	const [committed, setCommitted] = useState<{ search: string; scope: TBulkSearchReplaceScope } | null>(null)
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [bulkOpen, { open: openBulk, close: closeBulk }] = useDisclosure(false)
	// Default matches today's always-hide-deleted behavior - zero behavior change out of the box.
	// Organization-level only, same as OrganizationTable; service-level deleted stays unconditional.
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([{ id: 'deleted', value: false }])

	const deletedFilter = columnFilters.find(({ id }) => id === 'deleted')?.value as boolean | undefined
	const serviceTagIdsFilter = columnFilters.find(({ id }) => id === 'serviceTagIds')?.value as
		string[] | undefined
	const serviceAttributeIdsFilter = columnFilters.find(({ id }) => id === 'serviceAttributeIds')?.value as
		string[] | undefined

	const apiUtils = api.useUtils()
	const { data, isLoading, isFetching, isError } = api.bulkSearchReplace.search.useQuery(
		{
			search: committed?.search ?? '',
			scope: committed?.scope ?? scope,
			deleted: deletedFilter,
			serviceTagIds: serviceTagIdsFilter,
			serviceAttributeIds: serviceAttributeIdsFilter,
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ enabled: Boolean(committed), placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const results = data?.results ?? []
	const total = data?.total ?? 0

	const { t: tAttr } = useTranslation(['attribute', 'common'])
	const { t: tSvc } = useTranslation('services')

	// Unfiltered (not the bulk dialog's eligible-only subset) - the column needs every attached
	// attribute's name, including ones ineligible for bulk-add. Cheap, non-paginated, same call shape.
	const { data: allAttributes } = api.fieldOpt.attributesByCategory.useQuery({})
	const { data: tagCategories } = api.component.ServiceSelect.useQuery()
	const attributeLabelById = useMemo(() => {
		const map = new Map<string, string>()
		;(allAttributes ?? []).forEach((a) => map.set(a.attributeId, tAttr(a.attributeKey)))
		return map
	}, [allAttributes, tAttr])
	const tagLabelById = useMemo(() => {
		const map = new Map<string, string>()
		;(tagCategories ?? []).forEach((cat) => cat.services.forEach((tag) => map.set(tag.id, tSvc(tag.tsKey))))
		return map
	}, [tagCategories, tSvc])

	// Toolbar filter options - every known tag/attribute, not just ones present in the current results
	// (same maps the Service Tags/Attributes columns use to resolve id -> name), sorted for scanability.
	const serviceTagOptions = useMemo(
		() =>
			[...tagLabelById.entries()]
				.map(([value, label]) => ({ value, label }))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[tagLabelById]
	)
	const serviceAttributeOptions = useMemo(
		() =>
			[...attributeLabelById.entries()]
				.map(([value, label]) => ({ value, label }))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[attributeLabelById]
	)

	// Default: expand every org with matching services, and check every row with a replaceable match -
	// re-derived each time results resolve (not a mount-time-only seed, which would miss the async
	// fetch). This is synchronizing local UI state with a genuinely external event (a new search result
	// arriving), the case an effect is meant for - not derivable at render time, since it must still let
	// the user's own subsequent expand/collapse or check/uncheck edits stick until the next search.
	useEffect(() => {
		if (!data) return
		const nextExpanded: ExpandedState = {}
		const nextSelection: RowSelectionState = {}
		data.results.forEach((org) => {
			if (org.services.length) nextExpanded[org.id] = true
			if (isTextEligible(org.matches)) nextSelection[org.id] = true
			org.services.forEach((svc) => {
				if (isTextEligible(svc.matches)) nextSelection[svc.id] = true
			})
		})
		// eslint-disable-next-line react-hooks/set-state-in-effect -- justified above the effect
		setExpanded(nextExpanded)
		setRowSelection(nextSelection)
	}, [data])

	const replaceTextMutation = api.bulkSearchReplace.replaceText.useMutation({
		onSuccess: (result) => {
			apiUtils.bulkSearchReplace.search.invalidate()
			showNotification({
				message: `Replaced ${result.replaced}; ${result.skipped} had nothing left to replace; ${result.failed} failed.`,
				autoClose: 6000,
			})
		},
	})

	const handleSearch = () => {
		setCommitted({ search: searchText.trim(), scope })
	}

	const selectedKeys = Object.keys(rowSelection).filter((key) => rowSelection[key])
	const selectedOrgIds = new Set(results.filter((org) => selectedKeys.includes(org.id)).map((org) => org.id))
	const selectedServiceRows = results.flatMap((org) =>
		org.services.filter((svc) => selectedKeys.includes(svc.id))
	)

	const eligibleReplaceCount = (() => {
		let count = 0
		results.forEach((org) => {
			if (selectedKeys.includes(org.id) && org.matches.includes('orgDescription')) count++
			org.services.forEach((svc) => {
				if (
					selectedKeys.includes(svc.id) &&
					(svc.matches.includes('serviceName') || svc.matches.includes('serviceDescription'))
				) {
					count++
				}
			})
		})
		return count
	})()

	const handleReplaceAll = () => {
		const items: TReplaceTextItem[] = []
		results.forEach((org) => {
			if (selectedKeys.includes(org.id) && org.matches.includes('orgDescription')) {
				items.push({
					recordType: 'organization',
					field: 'description',
					id: org.id,
					searchTerm: committed?.search ?? '',
					replaceTerm: replaceText,
				})
			}
			org.services.forEach((svc) => {
				if (!selectedKeys.includes(svc.id)) return
				if (svc.matches.includes('serviceName')) {
					items.push({
						recordType: 'service',
						field: 'name',
						id: svc.id,
						searchTerm: committed?.search ?? '',
						replaceTerm: replaceText,
					})
				}
				if (svc.matches.includes('serviceDescription')) {
					items.push({
						recordType: 'service',
						field: 'description',
						id: svc.id,
						searchTerm: committed?.search ?? '',
						replaceTerm: replaceText,
					})
				}
			})
		})
		if (items.length) {
			replaceTextMutation.mutate({ items })
		}
	}

	const columns: DataTableColumn<TableRow>[] = [
		{
			id: 'actions',
			header: 'Actions',
			pin: 'left',
			size: 90,
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
			// Stacked, not side-by-side - the "Organization"/"Service" label and the actual name were
			// sharing one nowrap line, squeezing the name down to a handful of visible characters
			// regardless of the column's own width. Each gets its own full-width line instead.
			cell: ({ row, depth }) => (
				<Stack gap={2}>
					<Text size='xs' fw={700} c='dimmed' tt='uppercase'>
						{depth === 0 ? 'Organization' : 'Service'}
					</Text>
					<Text size='sm' fw={depth === 0 ? 600 : 400}>
						{row.name}
					</Text>
				</Stack>
			),
		},
		{
			id: 'matches',
			header: 'Matches',
			enableSorting: false,
			// A wider starting point than tanstack's 150px default, given this cell can hold several
			// highlighted lines - still user-resizable via the drag handle every column already has
			// (DataTable's `enableColumnResizing` is table-wide, not per-column).
			size: 320,
			accessorFn: () => undefined,
			cell: (ctx) => <MatchesCell {...ctx} searchTerm={committed?.search ?? ''} />,
		},
		{
			id: 'serviceTags',
			header: 'Service Tags',
			enableSorting: false,
			accessorFn: () => undefined,
			cell: (ctx) => (
				<NameLookupCell {...ctx} ids={(svc) => svc.tagIds} labelFor={(id) => tagLabelById.get(id)} />
			),
		},
		{
			id: 'attributes',
			header: 'Attributes',
			enableSorting: false,
			accessorFn: () => undefined,
			cell: (ctx) => (
				<NameLookupCell
					{...ctx}
					ids={(svc) => svc.attributeIds}
					labelFor={(id) => attributeLabelById.get(id)}
				/>
			),
		},
		{
			id: 'status',
			header: 'Status',
			size: 140,
			enableSorting: false,
			hiddenByDefault: true,
			cell: StatusCell,
		},
		{
			id: 'verified',
			header: 'Verified',
			size: 130,
			enableSorting: false,
			hiddenByDefault: true,
			cell: VerifiedCell,
		},
		{
			id: 'updatedAt',
			header: 'Updated',
			size: 150,
			enableSorting: false,
			hiddenByDefault: true,
			accessorFn: (row) => row.updatedAt,
			cell: DateCell,
		},
		{
			id: 'createdAt',
			header: 'Created',
			size: 150,
			enableSorting: false,
			hiddenByDefault: true,
			accessorFn: (row) => row.createdAt,
			cell: DateCell,
		},
	]

	return (
		<Stack gap='md'>
			<Fieldset legend='Search'>
				<Stack gap='sm'>
					<Group grow align='flex-end'>
						<TextInput
							label='Search for'
							placeholder='Text to find…'
							value={searchText}
							onChange={(e) => setSearchText(e.currentTarget.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
						<TextInput
							label='Replace with (optional)'
							placeholder='Replacement text…'
							value={replaceText}
							onChange={(e) => setReplaceText(e.currentTarget.value)}
						/>
					</Group>
					<Group justify='space-between' wrap='wrap'>
						<Group gap='md' wrap='wrap'>
							<Text size='xs' fw={700} c='dimmed' tt='uppercase'>
								Search in:
							</Text>
							{(Object.keys(FIELD_LABELS) as TMatchField[]).map((field) => (
								<Checkbox
									key={field}
									size='xs'
									label={FIELD_LABELS[field]}
									checked={scope[field]}
									onChange={(e) => {
										// Read `checked` synchronously, before calling setState - a native event's
										// `currentTarget` is only valid while the event is actively dispatching;
										// reading it lazily inside the functional updater below risks React
										// invoking that updater after the browser has already nulled it out.
										const checked = e.currentTarget.checked
										setScope((prev) => ({ ...prev, [field]: checked }))
									}}
								/>
							))}
						</Group>
						<Button size='sm' onClick={handleSearch} disabled={!searchText.trim()} loading={isFetching}>
							Search
						</Button>
					</Group>
				</Stack>
			</Fieldset>

			{committed && (
				<>
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							{isLoading ? 'Searching…' : `${total} organization(s) matched`}
						</Text>
						<Group gap={8}>
							<Button
								size='xs'
								disabled={!replaceText.trim() || eligibleReplaceCount === 0}
								loading={replaceTextMutation.isPending}
								onClick={handleReplaceAll}
							>
								Replace All{eligibleReplaceCount > 0 ? ` (${eligibleReplaceCount})` : ''}
							</Button>
							<Button size='xs' variant='default' disabled={selectedKeys.length === 0} onClick={openBulk}>
								Add / Remove Tag or Attribute{selectedKeys.length > 0 ? ` (${selectedKeys.length})` : ''}
							</Button>
						</Group>
					</Group>

					<DataTable
						data={results as TableRow[]}
						columns={columns}
						getSubRows={getSubRows}
						getRowId={getRowId}
						getRowStyle={(row) =>
							(row as OrgRow | ServiceRow).deleted ? { textDecoration: 'line-through' } : undefined
						}
						expanded={expanded}
						onExpandedChange={setExpanded}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						enableRowSelection
						sorting={[]}
						onSortingChange={() => undefined}
						columnFilters={columnFilters}
						onColumnFiltersChange={setColumnFilters}
						globalFilter=''
						onGlobalFilterChange={() => undefined}
						pagination={pagination}
						onPaginationChange={setPagination}
						mode={{ serverSide: true, rowCount: total }}
						isLoading={isLoading}
						isFetching={isFetching}
						isError={isError}
						emptyMessage='No organizations or services matched.'
						toolbarExtra={
							<>
								<MultiSelect
									size='xs'
									label='Service Tags'
									styles={COMPACT_MULTISELECT_STYLES}
									data={serviceTagOptions}
									value={serviceTagIdsFilter ?? []}
									onChange={(next) => {
										setColumnFilters((prev) => {
											const without = prev.filter(({ id }) => id !== 'serviceTagIds')
											return next.length > 0 ? [...without, { id: 'serviceTagIds', value: next }] : without
										})
									}}
									renderPill={renderFilterPill}
									w={190}
								/>
								<MultiSelect
									size='xs'
									label='Attributes'
									styles={COMPACT_MULTISELECT_STYLES}
									data={serviceAttributeOptions}
									value={serviceAttributeIdsFilter ?? []}
									onChange={(next) => {
										setColumnFilters((prev) => {
											const without = prev.filter(({ id }) => id !== 'serviceAttributeIds')
											return next.length > 0
												? [...without, { id: 'serviceAttributeIds', value: next }]
												: without
										})
									}}
									renderPill={renderFilterPill}
									w={190}
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
				</>
			)}

			<BulkEditDialog
				opened={bulkOpen}
				onClose={closeBulk}
				selectedServices={selectedServiceRows}
				ignoredOrgCount={selectedOrgIds.size}
				onDone={() => {
					closeBulk()
					apiUtils.bulkSearchReplace.search.invalidate()
				}}
			/>
		</Stack>
	)
}
