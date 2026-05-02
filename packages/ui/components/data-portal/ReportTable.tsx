import {
	ActionIcon,
	createStyles,
	Group,
	Modal,
	rem,
	Select,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	type MRT_Icons,
	MRT_ShowHideColumnsButton,
	type MRT_TableInstance,
	MRT_ToggleFiltersButton,
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { type Route } from 'nextjs-routes'
import { useCallback, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { ReportStatus } from '@weareinreach/db/enums'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type ReportRecord = ApiOutput['report']['forReportsTable'][number]

const useStyles = createStyles((_theme) => ({
	bottomBar: {
		paddingTop: rem(20),
	},
}))

const customIcons: Partial<MRT_Icons> = {
	IconSearch: (props: Record<string, unknown>) => <Icon icon='carbon:search' color='#40c057' {...props} />,
	IconSortAscending: () => <Icon icon={'carbon:chevron-up'} color='black' />,
	IconSortDescending: () => <Icon icon={'carbon:chevron-down'} color='black' />,
}

const STATUS_OPTIONS = [
	{ value: ReportStatus.PENDING, label: 'Pending' },
	{ value: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
	{ value: ReportStatus.RESOLVED, label: 'Resolved' },
]

const StatusSelect = ({ report }: { report: ReportRecord }) => {
	const apiUtils = api.useUtils()
	const updateMutation = api.report.update.useMutation({
		onSuccess: () => apiUtils.report.forReportsTable.invalidate(),
	})

	return (
		<Select
			data={STATUS_OPTIONS}
			value={report.status}
			onChange={(val) => updateMutation.mutate({ id: report.id, status: val as ReportStatus })}
			size='xs'
			sx={{ width: rem(130) }}
		/>
	)
}

const ReportDetailsModal = ({
	report,
	opened,
	onClose,
}: {
	report: ReportRecord
	opened: boolean
	onClose: () => void
}) => {
	// Ensure initialization always uses a string even if DB relation is missing or mis-typed
	const [internalNote, setInternalNote] = useState<string>(
		typeof report.internalNotes === 'string' ? report.internalNotes : ''
	)
	const apiUtils = api.useUtils()
	const updateMutation = api.report.update.useMutation({
		onSuccess: () => {
			apiUtils.report.forReportsTable.invalidate()
			onClose()
		},
	})

	return (
		<Modal opened={opened} onClose={onClose} title='Report Details' size='lg'>
			<Stack>
				<Group grow>
					<Stack spacing={0}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Reporter
						</Text>
						<Text size='sm'>{report.userName || 'Anonymous'}</Text>
						<Text size='xs' color='dimmed'>
							{report.userEmail}
						</Text>
					</Stack>
					<Stack spacing={0}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Issue Type
						</Text>
						<Text size='sm' sx={{ textTransform: 'capitalize' }}>
							{report.issueType.replace(/-/g, ' ')}
						</Text>
						{report.language && (
							<Text size='xs' color='dimmed'>
								Language:{' '}
								{Array.isArray(report.language)
									? (report.language[0] as unknown as { localeCode: string })?.localeCode
									: (report.language as unknown as { localeCode: string })?.localeCode || 'Unknown'}
							</Text>
						)}
					</Stack>
				</Group>

				<Stack spacing={4}>
					<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
						User Note
					</Text>
					<Text
						size='sm'
						p='xs'
						sx={(theme) => ({ backgroundColor: theme.colors.gray[0], borderRadius: theme.radius.sm })}
					>
						{report.note || 'No note provided.'}
					</Text>
				</Stack>

				{report.incorrectFields && report.incorrectFields.length > 0 && (
					<Stack spacing={4}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Fields Identified as Incorrect
						</Text>
						<Group spacing='xs'>
							{report.incorrectFields.map((f) => (
								<Text
									key={f}
									size='xs'
									px={8}
									py={2}
									sx={(theme) => ({ backgroundColor: theme.colors.gray[2], borderRadius: theme.radius.xl })}
								>
									{f}
								</Text>
							))}
						</Group>
					</Stack>
				)}

				<Textarea
					label='Internal Resolution Note'
					placeholder='Describe how this was handled...'
					value={internalNote}
					onChange={(e) => setInternalNote(e.currentTarget.value)}
					minRows={3}
				/>

				<Group position='right' mt='md'>
					<ActionIcon
						variant='filled'
						color='blue'
						size='lg'
						onClick={() => updateMutation.mutate({ id: report.id, internalNotes: internalNote })}
						loading={updateMutation.isLoading}
					>
						<Icon icon='carbon:save' />
					</ActionIcon>
				</Group>
			</Stack>
		</Modal>
	)
}

const BottomBar = ({ table }: { table: MRT_TableInstance<ReportRecord> }) => {
	const { classes } = useStyles()
	const filteredRowCount = table.getFilteredRowModel().rows.length
	const preFilteredRowCount = table.getPreFilteredRowModel().rows.length

	if (preFilteredRowCount !== filteredRowCount) {
		return (
			<div className={classes.bottomBar}>
				<Text variant='utility3'>
					Showing {filteredRowCount} of {preFilteredRowCount} results
				</Text>
			</div>
		)
	}

	return (
		<div className={classes.bottomBar}>
			<Text variant='utility3'>{preFilteredRowCount} results</Text>
		</div>
	)
}

export const ReportTable = () => {
	const variants = useCustomVariant()
	const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
	const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)
	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)

	const { data, isLoading, isError, isFetching } = api.report.forReportsTable.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})

	const columns = useMemo<MRT_ColumnDef<ReportRecord>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableColumnFilter: false,
			},
			{
				id: 'target',
				header: 'Reported Item',
				accessorFn: (row) => row.serviceNameSnapshot || row.orgNameSnapshot,
				size: 250,
				Cell: ({ row }) => (
					<Stack spacing={0}>
						<Text
							weight={500}
							size='sm'
							variant={
								row.original.status === 'RESOLVED' ? variants.Text.utility4darkGray : variants.Text.utility4
							}
						>
							{row.original.serviceNameSnapshot || row.original.orgNameSnapshot}
						</Text>
						<Text size='xs' color='dimmed' italic>
							{row.original.serviceId
								? `Service ID: ${row.original.serviceId}`
								: `Org ID: ${row.original.organizationId}`}
						</Text>
					</Stack>
				),
			},
			{
				accessorKey: 'issueType',
				header: 'Issue Type',
				Cell: ({ cell }) => (
					<Text size='sm' sx={{ textTransform: 'capitalize' }}>
						{cell.getValue<string>().toLowerCase().replace(/-/g, ' ')}
					</Text>
				),
				filterVariant: 'multi-select',
			},
			{
				accessorKey: 'status',
				header: 'Status',
				Cell: ({ row }) => <StatusSelect report={row.original} />,
				filterVariant: 'select',
			},
			{
				accessorKey: 'userName',
				header: 'Reporter',
				Cell: ({ row }) => (
					<Tooltip label={row.original.userEmail || 'No email provided'} withinPortal>
						<Text size='sm'>{row.original.userName || 'Anonymous'}</Text>
					</Tooltip>
				),
			},
			{
				accessorKey: 'createdAt',
				header: 'Submitted',
				Cell: ({ cell }) => {
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATETIME_SHORT)} withinPortal>
							<span>{date.toRelative()}</span>
						</Tooltip>
					)
				},
				sortingFn: 'datetime',
			},
		],
		[variants.Text.utility4, variants.Text.utility4darkGray]
	)

	const handleViewDetails = useCallback(
		(report: ReportRecord) => {
			setSelectedReport(report)
			openDetails()
		},
		[openDetails]
	)

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		icons: customIcons,
		enableColumnResizing: true,
		enableGlobalFilterModes: true,
		enableFacetedValues: true,
		enablePagination: false,
		enablePinning: true,
		enableRowActions: true,
		enableRowVirtualization: true,
		rowVirtualizerInstanceRef,
		positionGlobalFilter: 'left',
		mantineSearchTextInputProps: {
			placeholder: 'Search Reports',
			icon: null, // Ensure the icon is not rendered inside the box
			sx: {
				'& .mantine-TextInput-input': {
					borderRadius: 0,
					height: rem(48),
					width: rem(400),
				},
			},
			variant: 'default',
		},
		globalFilterModeOptions: ['contains', 'fuzzy', 'startsWith', 'endsWith'],
		columnFilterDisplayMode: 'popover',
		initialState: {
			sorting: [{ id: 'createdAt', desc: true }],
			columnVisibility: { id: false },
			columnPinning: { left: ['mrt-row-actions'] },
			showGlobalFilter: true,
		},
		state: {
			isLoading,
			showAlertBanner: isError,
			showProgressBars: isFetching,
			density: 'xs',
		},
		mantinePaperProps: { miw: '85%' },
		mantineTableContainerProps: { mah: '60vh' },
		mantineTableBodyCellProps: ({ row }) => ({
			sx: (theme) => ({
				color: row.original.status === 'RESOLVED' ? theme.other.colors.secondary.darkGray : undefined,
			}),
		}),
		mantineTableProps: { striped: true },
		renderRowActions: ({ row }) => {
			const editUrl: Route = row.original.serviceId
				? {
						pathname: '/org/[slug]/[orgLocationId]/edit',
						query: { slug: row.original.organization.slug, orgLocationId: row.original.serviceId },
					}
				: {
						pathname: '/org/[slug]/edit',
						query: { slug: row.original.organization.slug },
					}

			return (
				<Group noWrap spacing={8}>
					<Tooltip label='View Details' withinPortal>
						<ActionIcon onClick={() => handleViewDetails(row.original)}>
							<Icon icon='carbon:search' />
						</ActionIcon>
					</Tooltip>
					<Tooltip label='Edit Target' withinPortal>
						<ActionIcon
							component={Link}
							href={editUrl}
							// @ts-expect-error ignore the blank target error
							target='_blank'
						>
							<Icon icon='carbon:edit' />
						</ActionIcon>
					</Tooltip>
				</Group>
			)
		},
		renderToolbarInternalActions: ({ table }) => (
			<Group spacing='xs'>
				<MRT_ToggleFiltersButton table={table} />
				<MRT_ShowHideColumnsButton table={table} />
			</Group>
		),
		renderBottomToolbar: ({ table }) => <BottomBar table={table} />,
	})

	return (
		<>
			<MantineReactTable table={table} />
			{selectedReport && (
				<ReportDetailsModal report={selectedReport} opened={detailsOpened} onClose={closeDetails} />
			)}
		</>
	)
}
