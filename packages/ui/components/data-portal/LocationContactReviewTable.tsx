import {
	ActionIcon,
	Group,
	List,
	type MantineTheme,
	Stack,
	Text,
	Title,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { type ColumnFiltersState, type ExpandedState } from '@tanstack/react-table'
import { type Route } from 'nextjs-routes'
import { useCallback, useMemo, useState } from 'react'

import { type ApiInput, type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import {
	DataTable,
	type DataTableColumn,
	type DataTablePaginationState,
	type DataTableSortingState,
} from './DataTable'

type ReviewRow = ApiOutput['locationContactReview']['list'][number]
type Choice = ApiInput['locationContactReview']['decide']['choice']
/** A parent row: one organization, with its review items as child rows (same layout as OrganizationTable). */
interface OrgGroup {
	org: ReviewRow['org']
	items: ReviewRow[]
}
type TableRow = OrgGroup | ReviewRow
const isOrgGroup = (row: TableRow): row is OrgGroup => 'items' in row
const getSubRows = (row: TableRow) => (isOrgGroup(row) ? (row.items as TableRow[]) : undefined)
const getRowId = (row: TableRow) => (isOrgGroup(row) ? row.org.id : row.id)

const TYPE_LABEL: Record<ReviewRow['type'], string> = {
	phone: 'Phone',
	email: 'Email',
	website: 'Website',
	socialMedia: 'Social media',
}

/** "A", "A and B", "A, B and C". */
const joinNames = (names: string[]) =>
	names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

/**
 * The three answers. `label`/`help` are the generic wording for the instructions above the table; `forRow`
 * spells the same answer out with that row's own organization and location names, for its icon's tooltip.
 */
interface ChoiceOption {
	choice: Choice
	icon: 'carbon:building' | 'carbon:location-company' | 'carbon:location' | 'carbon:close-outline'
	label: string
	help: string
	forRow: (org: string, locations: string) => string
}

const CHOICES: ChoiceOption[] = [
	{
		choice: 'orgOnly',
		icon: 'carbon:building',
		label: 'Organization page only',
		help: "Display only on the organization's main page and not the location page(s).",
		forRow: (org, locations) => `${org} page only - remove it from ${locations}`,
	},
	{
		choice: 'orgAndLocations',
		icon: 'carbon:location-company',
		label: 'Organization page and location(s)',
		help: "Display on the organization's main page as well as the location page(s).",
		forRow: (org, locations) => `${org} page and ${locations}`,
	},
	{
		choice: 'locationsOnly',
		icon: 'carbon:location',
		label: 'Location(s) only',
		help: "Display only on the location page(s) and not the organization's main page.",
		forRow: (org, locations) => `${locations} only - not on the ${org} page`,
	},
]

/**
 * The two answers for an item that isn't linked to any location (marked location-only with no location -
 * often one of the organization's services' numbers). `locations` is the "N services" wording here.
 */
const NO_LOCATION_CHOICES: ChoiceOption[] = [
	{
		choice: 'orgOnly',
		icon: 'carbon:building',
		label: 'Organization page',
		help: "Display on the organization's main page.",
		forRow: (org) => `${org} page`,
	},
	{
		choice: 'locationsOnly',
		icon: 'carbon:close-outline',
		label: 'Not on the organization page',
		help: "Don't display it on the organization's main page (it still shows on any services it's linked to).",
		forRow: (org, services) => `Not on the ${org} page${services ? ` - only on its ${services}` : ''}`,
	},
]

const servicesText = (count: number) => (count ? `${count} ${count === 1 ? 'service' : 'services'}` : '')

/**
 * Where the item shows today, as a sentence: "Organization page and Flagship Cafe location", "Only Flagship
 * Cafe location" or "Only Downtown and Midtown locations".
 */
const showsNow = (row: ReviewRow) => {
	if (!row.locations.length) {
		const services = servicesText(row.services)
		if (row.showOnOrgPage) {
			return services ? `Organization page and ${services}` : 'Organization page'
		}
		return services ? `Only ${services}` : 'Not displayed'
	}
	const locations = `${joinNames(row.locations.map(({ name }) => `"${name}"`))} ${row.locations.length === 1 ? 'location' : 'locations'}`
	return row.showOnOrgPage ? `Organization page and ${locations}` : `Only ${locations}`
}

/** Same Edit icon as OrganizationTable's - on the organization row, opens it to check before deciding. */
const EditOrgAction = ({ org, theme }: { org: ReviewRow['org']; theme: MantineTheme }) => {
	const editUrl: Route = { pathname: '/org/[slug]/edit', query: { slug: org.slug } }
	return (
		<Tooltip label={`Edit ${org.name} (opens in a new tab)`} multiline w={260}>
			<ActionIcon variant='subtle' component={Link} href={editUrl} target='_blank' aria-label='Edit'>
				<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
			</ActionIcon>
		</Tooltip>
	)
}

interface ChoiceActionsProps {
	row: ReviewRow
	theme: MantineTheme
	pendingId: string | null
	onDecide: (row: ReviewRow, choice: Choice) => () => void
}

/**
 * On each item row: the three answers (two for an item with no location), in the same small icon-button style
 * as the other Data Portal tables' Actions columns (ReportTable, OrganizationTable).
 */
const ChoiceActions = ({ row, theme, pendingId, onDecide }: ChoiceActionsProps) => {
	const isPending = pendingId === row.id
	const isBlocked = pendingId !== null && !isPending
	const hasLocations = row.locations.length > 0
	const where = hasLocations ? joinNames(row.locations.map(({ name }) => name)) : servicesText(row.services)
	return (
		<Group wrap='nowrap' gap={4}>
			{(hasLocations ? CHOICES : NO_LOCATION_CHOICES).map(({ choice, icon, label, forRow }) => (
				<Tooltip key={choice} label={forRow(row.org.name, where)} multiline w={260}>
					<ActionIcon
						variant='subtle'
						aria-label={label}
						onClick={onDecide(row, choice)}
						loading={isPending}
						disabled={isBlocked}
					>
						<Icon icon={icon} color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			))}
		</Group>
	)
}

/** Matches an item against the search box - its organization, contact info, type or locations. */
const matchesSearch = (row: ReviewRow, query: string) =>
	[row.org.name, row.value, TYPE_LABEL[row.type], showsNow(row)].some((text) =>
		text.toLowerCase().includes(query)
	)

/**
 * Groups items under their organization. The search box and Type filter are applied to the items first:
 * DataTable's own search and filters only look at the top-level (organization) rows, so each organization row
 * carries its remaining items' text below and keeps showing exactly the items that matched.
 */
const groupByOrg = (rows: ReviewRow[], search: string, typeFilter: string | undefined): OrgGroup[] => {
	const query = search.trim().toLowerCase()
	const groups = new Map<string, OrgGroup>()
	for (const row of rows) {
		if ((query && !matchesSearch(row, query)) || (typeFilter && TYPE_LABEL[row.type] !== typeFilter)) {
			continue
		}
		const group = groups.get(row.org.id) ?? { org: row.org, items: [] }
		group.items.push(row)
		groups.set(row.org.id, group)
	}
	return [...groups.values()].toSorted((a, b) => a.org.name.localeCompare(b.org.name))
}

const NO_MAIN_PAGE_PHONE = 'main page has no phone number'

/**
 * The organization row's name and how many items are left: "Access Alliance (3) · main page has no phone
 * number".
 */
const OrgName = ({ group }: { group: OrgGroup }) => (
	<>
		{`${group.org.name} (${group.items.length})`}
		{!group.org.mainPageHasPhone && (
			<Text component='span' inherit c='dimmed'>
				{` · ${NO_MAIN_PAGE_PHONE}`}
			</Text>
		)}
	</>
)

/** An organization row's value for a column: its items' values, so search and the Type filter keep the row. */
const orgRowValue = (group: OrgGroup, itemValue: (item: ReviewRow) => string) => {
	const values = [...new Set(group.items.map(itemValue))]
	return values.length === 1 ? values[0] : values.join(' | ')
}

/**
 * The data managers' review list for the location-vs-organization contact cleanup: every phone, email,
 * website and social media item the cleanup migration couldn't decide on by itself. Each one is saved once
 * and attached to both its organization and some of its locations - which is what both "the organization's
 * info, also linked to a location" and "a location's own info, automatically attached to the organization by
 * the old code" look like. A person who knows the organization picks which; the answer takes the row off the
 * list.
 */
export const LocationContactReviewTable = () => {
	const theme = useMantineTheme()
	const apiUtils = api.useUtils()
	const { data, isLoading, isError } = api.locationContactReview.list.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})
	const [search, setSearch] = useState('')
	const [sorting, setSorting] = useState<DataTableSortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	// Every organization starts expanded, so its items show without an extra click per row.
	const [expanded, setExpanded] = useState<ExpandedState>(true)
	const [pagination, setPagination] = useState<DataTablePaginationState>({ pageIndex: 0, pageSize: 50 })
	const [pendingId, setPendingId] = useState<string | null>(null)

	const notifyError = useNewNotification({
		displayText: 'Something went wrong saving this decision. Please try again.',
		icon: 'warning',
	})

	const decide = api.locationContactReview.decide.useMutation({
		onSuccess: ({ id, type, choice }) => {
			// Patched in the cached list directly rather than refetched - same reason as the contact
			// drawers: a read right after a write can come back without the change. A phone now shown on the
			// organization's main page (either "Organization page" choice) clears that organization's "main
			// page has no phone number" note.
			apiUtils.locationContactReview.list.setData(undefined, (old) => {
				const decided = old?.find((row) => row.id === id)
				const addsMainPagePhone = type === 'phone' && choice !== 'locationsOnly' && decided
				return old
					?.filter((row) => row.id !== id)
					.map((row) =>
						addsMainPagePhone && row.org.id === decided.org.id
							? { ...row, org: { ...row.org, mainPageHasPhone: true } }
							: row
					)
			})
		},
		onError: () => notifyError(),
		onSettled: () => setPendingId(null),
	})

	const handleDecide = useCallback(
		(row: ReviewRow, choice: Choice) => () => {
			setPendingId(row.id)
			decide.mutate({ type: row.type, id: row.id, choice })
		},
		[decide]
	)

	const columns = useMemo<DataTableColumn<TableRow>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 160,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: ({ row }) =>
					isOrgGroup(row) ? (
						<EditOrgAction org={row.org} theme={theme} />
					) : (
						<ChoiceActions row={row} theme={theme} pendingId={pendingId} onDecide={handleDecide} />
					),
			},
			{
				id: 'org',
				header: 'Organization',
				size: 260,
				accessorFn: (row) => row.org.name,
				cell: ({ row }) => (isOrgGroup(row) ? <OrgName group={row} /> : ''),
			},
			{
				id: 'type',
				header: 'Type',
				size: 110,
				enableSorting: false,
				accessorFn: (row) =>
					isOrgGroup(row) ? orgRowValue(row, (item) => TYPE_LABEL[item.type]) : TYPE_LABEL[row.type],
				cell: ({ row, value }) => (isOrgGroup(row) ? '' : String(value)),
				filter: {
					type: 'select',
					options: Object.values(TYPE_LABEL).map((label) => ({ value: label, label })),
				},
			},
			{
				id: 'value',
				header: 'Contact info',
				size: 260,
				enableSorting: false,
				accessorFn: (row) => (isOrgGroup(row) ? orgRowValue(row, (item) => item.value) : row.value),
				cell: ({ row, value }) => (isOrgGroup(row) ? '' : String(value)),
			},
			{
				id: 'showsNow',
				header: 'Currently displayed',
				size: 380,
				enableSorting: false,
				accessorFn: (row) => (isOrgGroup(row) ? orgRowValue(row, showsNow) : showsNow(row)),
				cell: ({ row, value }) => (isOrgGroup(row) ? '' : String(value)),
			},
		],
		[handleDecide, pendingId, theme]
	)

	const typeFilter = columnFilters.find(({ id }) => id === 'type')?.value as string | undefined
	const groups = useMemo(() => groupByOrg(data ?? [], search, typeFilter), [data, search, typeFilter])

	const rows = data ?? []
	const orgCount = new Set(rows.map(({ org }) => org.id)).size
	const iconColor = theme.other.colors.primary.allyGreen

	return (
		<>
			<Stack gap={8} mb='md' maw={780}>
				<Title order={3}>Why is this list here?</Title>
				<Text size='sm'>
					Previously, contact info added on a location&apos;s page was also shown on the organization&apos;s
					main page, sometimes resulting in duplicate information being displayed. That has been fixed for new
					entries. For most older contact info, the system could work out what should be displayed where - for
					example when the organization already had its own separate copy, or when an email was only ever
					stored under a location.
				</Text>
				<Text size='sm'>
					For the items below, it could not. Each one is stored once, under both the organization and some of
					its locations. That happens in two ways that look exactly the same to the display code, so we
					don&apos;t know where the information should really be displayed:
				</Text>
				<List size='sm' spacing={2}>
					<List.Item>
						It was added on the <strong>organization&apos;s</strong> page, and later added to a location via
						the &apos;link to location&apos; option - here the likely intention was to display the information
						in both places.
					</List.Item>
					<List.Item>
						It was created new on a <strong>location&apos;s</strong> page, and the old system automatically
						stored it under the organization too - it <strong>should not</strong> show on the
						organization&apos;s main page.
					</List.Item>
				</List>
				<Text size='sm'>
					Phone numbers are also listed when every one of an organization&apos;s numbers is at a location and
					none is on its main page - the system can&apos;t tell whether one of them should be the
					organization&apos;s main number. These organizations are marked &quot;{NO_MAIN_PAGE_PHONE}&quot;.
				</Text>
				<Text size='sm'>
					A few items aren&apos;t listed at any location - for example a number used by the
					organization&apos;s services. They have just two choices: keep it on the organization&apos;s main
					page, or not (it still shows on its services).
				</Text>
				<Text size='sm'>
					For each item, pick where it belongs using the icons in the Actions column (hover an icon to see
					exactly what it will do for that item):
				</Text>
				{CHOICES.map(({ choice, icon, label, help }) => (
					<Group key={choice} gap={8} wrap='nowrap' align='flex-start'>
						<Icon icon={icon} color={iconColor} height={20} width={20} />
						<Text size='sm'>
							<strong>{label}</strong> - {help}
						</Text>
					</Group>
				))}
				<Text size='sm' c='dimmed'>
					Your choice is saved right away and the item leaves this list. Not sure? Use the edit icon to open
					the organization in a new tab to review all of the details.
				</Text>
			</Stack>
			{/* Same look as the other tables' ResultCount ("Total: N"), with "(items)" after the number. */}
			<Text size='sm' c='dimmed'>
				{`Left to review (${orgCount} organizations): ${rows.length.toLocaleString()} (items)`}
			</Text>
			<DataTable
				data={groups}
				columns={columns}
				getRowId={getRowId}
				getSubRows={getSubRows}
				expanded={expanded}
				onExpandedChange={setExpanded}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				sorting={sorting}
				onSortingChange={setSorting}
				globalFilter={search}
				onGlobalFilterChange={setSearch}
				globalFilterPlaceholder='Search organizations, contact info, locations'
				pagination={pagination}
				onPaginationChange={setPagination}
				isLoading={isLoading}
				isError={isError}
				errorMessage='Could not load the review list.'
				emptyMessage='Nothing left to review.'
			/>
		</>
	)
}
