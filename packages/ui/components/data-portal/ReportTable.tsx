import {
	ActionIcon,
	Badge,
	Checkbox,
	Divider,
	Group,
	type MantineTheme,
	Modal,
	rem,
	Select,
	Stack,
	Text,
	Textarea,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { type Route } from 'nextjs-routes'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { ReportIssueType, ReportStatus } from '@weareinreach/db/enums'
import { Button } from '~ui/components/core/Button'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'

type ReportRecord = ApiOutput['report']['forReportsTable']['results'][number]

/** Columns the server-side query can sort by. */
type ReportSortableColumnId =
	'orgNameSnapshot' | 'serviceNameSnapshot' | 'issueType' | 'status' | 'informed' | 'createdAt' | 'updatedAt'

const ISSUE_TYPE_OPTIONS = Object.values(ReportIssueType).map((value) => ({
	value,
	label: value.replaceAll('-', ' '),
}))

const getUserNoteStyle = (theme: MantineTheme) => ({
	backgroundColor: theme.colors.gray[0],
	borderRadius: theme.radius.sm,
	whiteSpace: 'pre-wrap' as const,
})

const getInternalHistoryStyle = (theme: MantineTheme) => ({
	maxHeight: rem(200),
	overflowY: 'auto' as const,
	backgroundColor: theme.colors.gray[0],
	borderRadius: theme.radius.sm,
	border: `${rem(1)} solid ${theme.colors.gray[3]}`,
})

// --- Helper Components ---

const ReportDetailsModal = ({
	report,
	opened,
	onClose,
}: {
	report: ReportRecord
	opened: boolean
	onClose: () => void
}) => {
	const [status, setStatus] = useState<ReportStatus>(report.status as ReportStatus)
	const [informed, setInformed] = useState<boolean>(report.informed)
	const [newNote, setNewNote] = useState<string>('')

	const apiUtils = api.useUtils()
	const updateMutation = api.report.update.useMutation({
		onSuccess: async () => {
			await apiUtils.report.forReportsTable.invalidate()
			setNewNote('')
			onClose()
		},
	})

	useEffect(() => {
		setStatus(report.status as ReportStatus)
		setInformed(report.informed)
		setNewNote('')
	}, [report.id, report.status, report.informed])

	const isDirty = status !== report.status || informed !== report.informed || newNote.trim().length > 0
	const isValid = status === ReportStatus.RESOLVED ? newNote.trim().length > 0 : true
	const canSave = isDirty && isValid

	const languageName = useMemo(() => {
		const l = Array.isArray(report.language) ? report.language[0] : report.language
		if (!l) return null
		// Cast to a known structure to safely access name fields
		const typedL = l as unknown as { name?: string; nativeName?: string; localeCode: string }

		// Attempt to resolve the English name using the Intl API to ensure it's always available for admins
		let englishName = typedL.name
		if (typedL.localeCode) {
			try {
				englishName = new Intl.DisplayNames(['en'], { type: 'language' }).of(typedL.localeCode) || typedL.name
			} catch (e) {
				// Fallback to name in DB if Intl API fails or locale is invalid
			}
		}

		const parts = []
		if (englishName) parts.push(englishName)
		if (typedL.nativeName && typedL.nativeName !== englishName) {
			parts.push(`(${typedL.nativeName})`)
		}
		if (typedL.localeCode) parts.push(`[${typedL.localeCode}]`)

		return parts.length > 0 ? parts.join(' ') : null
	}, [report.language])

	return (
		<Modal opened={opened} onClose={onClose} title='Report Details' size='lg'>
			<Stack gap='md'>
				{/* Header: Organization and Service Info */}
				<Stack align='flex-start' gap='xs'>
					<Group gap='xs' align='center'>
						<Stack gap={0}>
							<Text size='sm'>
								Organization Name: <strong>{report.orgNameSnapshot || 'Unknown'}</strong>
							</Text>
							<Text size='xs' c='dimmed' fs='italic'>
								Organization ID: {report.organizationId}
							</Text>
						</Stack>
						<Tooltip label='Edit Organization'>
							<ActionIcon
								component={Link}
								href={{
									pathname: '/org/[slug]/edit',
									query: { slug: report.organization.slug },
								}}
								target='_blank'
								variant='subtle'
								size='sm'
							>
								<Icon icon='carbon:edit' />
							</ActionIcon>
						</Tooltip>
					</Group>
					{report.serviceId && (
						<Stack gap={0}>
							<Text size='sm'>
								Service Name: <strong>{report.serviceNameSnapshot || 'Unknown'}</strong>
							</Text>
							<Text size='xs' c='dimmed' fs='italic'>
								Service ID: {report.serviceId}
							</Text>
						</Stack>
					)}
				</Stack>

				<Divider />

				{/* Metadata Section */}
				<Group grow align='flex-start'>
					<Stack gap={4}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
							Reporter
						</Text>
						<Stack gap={0}>
							<Text size='sm'>{report.userName || 'Anonymous'}</Text>
							<Text size='xs' c='dimmed'>
								{report.userEmail}
							</Text>
						</Stack>
					</Stack>
					<Stack gap={4}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
							Issue Type
						</Text>
						<Stack gap={0}>
							<Text size='sm' tt='capitalize'>
								{report.issueType.replaceAll('-', ' ')}
							</Text>
						</Stack>
					</Stack>
					{languageName && (
						<Stack gap={4}>
							<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
								Language
							</Text>
							<Text size='sm'>{languageName}</Text>
						</Stack>
					)}
				</Group>

				<Divider />

				<Group grow align='flex-end'>
					<Select
						label='Status'
						data={[
							{ value: ReportStatus.PENDING, label: 'Pending' },
							{ value: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
							{ value: ReportStatus.RESOLVED, label: 'Resolved' },
						]}
						value={status}
						onChange={(val) => setStatus(val as ReportStatus)}
					/>
					<Checkbox
						label='User Informed'
						checked={informed}
						onChange={(event) => setInformed(event.currentTarget.checked)}
						mb={10}
					/>
				</Group>

				{/* Reported Content Section */}
				{report.incorrectFields && report.incorrectFields.length > 0 && (
					<Stack gap={4}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
							Fields Identified as Incorrect
						</Text>
						<Group gap='xs'>
							{report.incorrectFields.map((field) => (
								<Badge key={field} variant='outline' size='sm' color='gray' tt='capitalize'>
									{field.replaceAll('-', ' ')}
								</Badge>
							))}
						</Group>
					</Stack>
				)}

				<Stack gap={4}>
					<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
						User Note
					</Text>
					<Text size='sm' p='xs' style={getUserNoteStyle}>
						{report.userNote || 'No note provided.'}
					</Text>
				</Stack>

				{/* Internal Notes History */}
				{report.internalNotes && report.internalNotes.length > 0 && (
					<Stack gap={4}>
						<Text size='xs' c='dimmed' tt='uppercase' fw={700}>
							Internal History
						</Text>
						<Stack gap='xs' p='xs' style={getInternalHistoryStyle}>
							{report.internalNotes.map((note) => (
								<div key={note.id}>
									<Group gap={4} align='center'>
										<Text size='xs' fw={700}>
											{note.user?.name || 'System'}
										</Text>
										<Text size='xs' c='dimmed'>
											•{' '}
											{DateTime.fromJSDate(new Date(note.createdAt)).toLocaleString(DateTime.DATETIME_SHORT)}
										</Text>
									</Group>
									<Text size='sm'>{note.text}</Text>
								</div>
							))}
						</Stack>
					</Stack>
				)}

				<Divider />

				{/* Admin Actions */}
				<Textarea
					label={status === ReportStatus.RESOLVED ? 'Resolution Note (Required)' : 'Internal Note'}
					placeholder={
						status === ReportStatus.RESOLVED
							? 'Describe how this was resolved...'
							: 'Add any internal notes here...'
					}
					value={newNote}
					onChange={(e) => setNewNote(e.currentTarget.value)}
					minRows={3}
				/>

				<Group justify='flex-end' mt='md'>
					<Button
						variant='primary'
						onClick={() => updateMutation.mutate({ id: report.id, status, informed, internalNotes: newNote })}
						loading={updateMutation.isPending}
						disabled={!canSave}
					>
						Save Changes
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}

// --- Column Cell Renderers ---
// Defined at module scope (rather than nested inside `ReportTable`) so React doesn't see a brand-new
// component identity on every render; anything a renderer needs beyond `row`/`value` is passed in as a
// prop instead of being read from closure.

interface ReportActionsCellProps extends DataTableCellContext<ReportRecord> {
	theme: MantineTheme
	onSelectReport: (report: ReportRecord) => void
	onOpenDetails: () => void
}

/** Cell renderer for the 'actions' column - opens the report details modal or the target org's edit page. */
const ReportActionsCell = ({ row, theme, onSelectReport, onOpenDetails }: ReportActionsCellProps) => {
	const editUrl: Route = { pathname: '/org/[slug]/edit', query: { slug: row.organization.slug } }
	return (
		<Group wrap='nowrap' gap={8}>
			<Tooltip label='View Details'>
				<ActionIcon
					variant='subtle'
					onClick={() => {
						onSelectReport(row)
						onOpenDetails()
					}}
				>
					<Icon icon='carbon:search' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='Edit Target'>
				<ActionIcon variant='subtle' component={Link} href={editUrl} target='_blank'>
					<Icon icon='carbon:edit' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</Group>
	)
}

/** Cell renderer for the 'id' column. */
const IdCell = ({ value }: DataTableCellContext<ReportRecord>) => <Text size='xs'>{value as string}</Text>

interface ReportNameCellProps extends DataTableCellContext<ReportRecord> {
	variants: ReturnType<typeof useCustomVariant>
}

/** Cell renderer for the 'orgNameSnapshot' column - dims once the report is resolved. */
const OrgNameCell = ({ value, row, variants }: ReportNameCellProps) => {
	const isResolved = row.status === ReportStatus.RESOLVED
	const name = (value as string) || 'Unknown'
	return (
		<Tooltip label={name}>
			<Text
				fw={500}
				size='sm'
				lineClamp={1}
				variant={isResolved ? variants.Text.utility4darkGray : variants.Text.utility4}
			>
				{name}
			</Text>
		</Tooltip>
	)
}

/** Cell renderer for the 'serviceNameSnapshot' column - dims once the report is resolved. */
const ServiceNameCell = ({ value, row, variants }: ReportNameCellProps) => {
	const isResolved = row.status === ReportStatus.RESOLVED
	const name = (value as string) || '-'
	return (
		<Tooltip label={name}>
			<Text
				size='sm'
				lineClamp={1}
				variant={isResolved ? variants.Text.utility4darkGray : variants.Text.utility4}
			>
				{name}
			</Text>
		</Tooltip>
	)
}

interface ReportStatusCellProps extends DataTableCellContext<ReportRecord> {
	theme: MantineTheme
}

/** Cell renderer for the 'status' column - colors by status and how stale the last update is. */
const StatusCell = ({ value, row, theme }: ReportStatusCellProps) => {
	const status = value as ReportStatus
	const updatedAt = DateTime.fromJSDate(new Date(row.updatedAt))
	const diff = DateTime.now().diff(updatedAt, ['days'])

	let color = theme.colors.gray[7]
	let weight = 500

	if (status === ReportStatus.PENDING) {
		weight = 700
		if (diff.days >= 3) color = theme.colors.red[7]
		else if (diff.days >= 1) color = theme.colors.orange[8]
		else color = theme.black
	} else if (status === ReportStatus.ACKNOWLEDGED) {
		color = theme.colors.blue[7]
		if (diff.days >= 7) color = theme.colors.orange[7]
	} else if (status === ReportStatus.RESOLVED) {
		color = theme.colors.gray[5]
		weight = 400
	}

	return (
		<Text size='sm' fw={weight} c={color} tt='capitalize'>
			{status.toLowerCase()}
		</Text>
	)
}

/** Cell renderer for the 'informed' column. */
const InformedCell = ({ value }: DataTableCellContext<ReportRecord>) => (
	<Icon
		icon={value ? 'carbon:checkmark-filled' : 'carbon:checkmark-outline'}
		color={value ? 'green' : 'gray'}
		height={18}
	/>
)

/** Cell renderer shared by the 'createdAt' and 'updatedAt' columns. */
const DateCell = ({ value }: DataTableCellContext<ReportRecord>) => {
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

// --- Main Table Component ---

export const ReportTable = () => {
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const router = useRouter()
	const { reportId } = router.query

	const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)

	// Clean up the URL when the modal is closed to prevent it from re-opening on refresh
	// and to allow the table to reset to the full list.
	const handleCloseDetails = useCallback(() => {
		closeDetails()
		setSelectedReport(null)
		if (router.query.reportId) {
			const { reportId: _removed, ...query } = router.query
			router.replace({ query }, undefined, { shallow: true })
		}
	}, [closeDetails, router])

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const statusFilter = columnFilters.find(({ id }) => id === 'status')?.value as ReportStatus | undefined
	const issueTypeFilter = columnFilters.find(({ id }) => id === 'issueType')?.value as string[] | undefined
	const informedFilter = columnFilters.find(({ id }) => id === 'informed')?.value as boolean | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isError, isFetching } = api.report.forReportsTable.useQuery(
		{
			status: statusFilter,
			issueType: issueTypeFilter as ReportIssueType[] | undefined,
			informed: informedFilter,
			search: debouncedGlobalFilter || undefined,
			createdAt: dateFilter('createdAt')
				? { from: dateFilter('createdAt')?.[0], to: dateFilter('createdAt')?.[1] }
				: undefined,
			updatedAt: dateFilter('updatedAt')
				? { from: dateFilter('updatedAt')?.[0], to: dateFilter('updatedAt')?.[1] }
				: undefined,
			sorting: sorting.map(({ id, desc }) => ({
				id: id as ReportSortableColumnId,
				desc,
			})),
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	// Deep-linking (`?reportId=`) opens a specific report's details regardless of the current page/filters -
	// a separate, independent lookup rather than trying to find it within whatever page happens to be loaded.
	const { data: linkedReportData } = api.report.forReportsTable.useQuery(
		{ id: typeof reportId === 'string' ? reportId : '', take: 1, skip: 0 },
		{ enabled: router.isReady && typeof reportId === 'string', refetchOnWindowFocus: false }
	)

	useEffect(() => {
		const linkedReport = linkedReportData?.results[0]
		if (linkedReport && !detailsOpened && selectedReport?.id !== linkedReport.id) {
			setSelectedReport(linkedReport)
			openDetails()
		}
	}, [linkedReportData, openDetails, detailsOpened, selectedReport?.id])

	const columns = useMemo<DataTableColumn<ReportRecord>[]>(
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
				cell: (ctx) => (
					<ReportActionsCell
						{...ctx}
						theme={theme}
						onSelectReport={setSelectedReport}
						onOpenDetails={openDetails}
					/>
				),
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
				id: 'orgNameSnapshot',
				header: 'Organization Name',
				size: 180,
				cell: (ctx) => <OrgNameCell {...ctx} variants={variants} />,
			},
			{
				id: 'serviceNameSnapshot',
				header: 'Service or Location Name',
				size: 180,
				cell: (ctx) => <ServiceNameCell {...ctx} variants={variants} />,
			},
			{
				id: 'issueType',
				header: 'Issue Type',
				size: 150,
				filter: { type: 'multi-select', options: ISSUE_TYPE_OPTIONS },
			},
			{
				id: 'status',
				header: 'Status',
				size: 150,
				filter: {
					type: 'select',
					options: [
						{ value: ReportStatus.PENDING, label: 'Pending' },
						{ value: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
						{ value: ReportStatus.RESOLVED, label: 'Resolved' },
					],
				},
				cell: (ctx) => <StatusCell {...ctx} theme={theme} />,
			},
			{
				id: 'informed',
				header: 'Informed',
				size: 100,
				align: 'center',
				filter: { type: 'checkbox', trueLabel: 'Informed', falseLabel: 'Not informed' },
				cell: InformedCell,
			},
			{
				id: 'createdAt',
				header: 'Created',
				size: 160,
				filter: { type: 'date-range' },
				cell: DateCell,
			},
			{
				id: 'updatedAt',
				header: 'Updated',
				size: 160,
				filter: { type: 'date-range' },
				cell: DateCell,
			},
		],
		[variants, theme, openDetails]
	)

	return (
		<>
			<DataTable
				data={data?.results ?? []}
				columns={columns}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				sorting={sorting}
				onSortingChange={setSorting}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				globalFilterPlaceholder='Search Reports'
				pagination={pagination}
				onPaginationChange={setPagination}
				mode={{ serverSide: true, rowCount: data?.total ?? 0 }}
				isLoading={isLoading}
				isFetching={isFetching}
				isError={isError}
			/>
			{selectedReport && (
				<ReportDetailsModal report={selectedReport} opened={detailsOpened} onClose={handleCloseDetails} />
			)}
		</>
	)
}
