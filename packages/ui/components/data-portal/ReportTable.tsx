import {
	ActionIcon,
	Badge,
	createStyles,
	Divider,
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
	type MRT_ColumnFilterFnsState,
	type MRT_ColumnFiltersState,
	MRT_ShowHideColumnsButton,
	type MRT_SortingState,
	type MRT_TableInstance,
	MRT_ToggleFiltersButton,
	type MRT_Virtualizer,
	useMantineReactTable,
} from 'mantine-react-table'
import { useRouter } from 'next/router'
import { type Route } from 'nextjs-routes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { ReportStatus } from '@weareinreach/db/enums'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

type ReportRecord = ApiOutput['report']['forReportsTable'][number]

const useStyles = createStyles((theme) => ({
	warning: { color: theme.other.colors.tertiary.red },
	bottomBar: { paddingTop: rem(20) },
}))

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
	const [internalNote, setInternalNote] = useState<string>('')
	const apiUtils = api.useUtils()
	const updateMutation = api.report.update.useMutation({
		onSuccess: () => {
			apiUtils.report.forReportsTable.invalidate()
			onClose()
		},
	})

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
			<Stack spacing='md'>
				{/* Header: Organization and Service Info */}
				<Stack align='flex-start' spacing='xs'>
					<Group spacing='xs' align='center'>
						<Stack spacing={0}>
							<Text size='sm'>
								Organization Name: <strong>{report.orgNameSnapshot || 'Unknown'}</strong>
							</Text>
							<Text size='xs' color='dimmed' italic>
								Organization ID: {report.organizationId}
							</Text>
						</Stack>
						<Tooltip label='Edit Organization' withinPortal>
							<ActionIcon
								component={Link}
								href={{
									pathname: '/org/[slug]/edit',
									query: { slug: report.organization.slug },
								}}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-expect-error ignore blank target error
								target='_blank'
								variant='subtle'
								size='sm'
							>
								<Icon icon='carbon:edit' />
							</ActionIcon>
						</Tooltip>
					</Group>
					{report.serviceId && (
						<Stack spacing={0}>
							<Text size='sm'>
								Service Name: <strong>{report.serviceNameSnapshot || 'Unknown'}</strong>
							</Text>
							<Text size='xs' color='dimmed' italic>
								Service ID: {report.serviceId}
							</Text>
						</Stack>
					)}
				</Stack>

				<Divider />

				{/* Metadata Section */}
				<Group grow align='flex-start'>
					<Stack spacing={4}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Reporter
						</Text>
						<Stack spacing={0}>
							<Text size='sm'>{report.userName || 'Anonymous'}</Text>
							<Text size='xs' color='dimmed'>
								{report.userEmail}
							</Text>
						</Stack>
					</Stack>
					<Stack spacing={4}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Issue Type
						</Text>
						<Stack spacing={0}>
							<Text size='sm' sx={{ textTransform: 'capitalize' }}>
								{report.issueType.replace(/-/g, ' ')}
							</Text>
						</Stack>
					</Stack>
					{languageName && (
						<Stack spacing={4}>
							<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
								Language
							</Text>
							<Text size='sm'>{languageName}</Text>
						</Stack>
					)}
				</Group>

				{/* Reported Content Section */}
				{report.incorrectFields && report.incorrectFields.length > 0 && (
					<Stack spacing={4}>
						<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
							Fields Identified as Incorrect
						</Text>
						<Group spacing='xs'>
							{report.incorrectFields.map((field) => (
								<Badge
									key={field}
									variant='outline'
									size='sm'
									color='gray'
									sx={{ textTransform: 'capitalize' }}
								>
									{field.replace(/-/g, ' ')}
								</Badge>
							))}
						</Group>
					</Stack>
				)}

				<Stack spacing={4}>
					<Text size='xs' color='dimmed' transform='uppercase' weight={700}>
						User Note
					</Text>
					<Text
						size='sm'
						p='xs'
						sx={(theme) => ({
							backgroundColor: theme.colors.gray[0],
							borderRadius: theme.radius.sm,
							whiteSpace: 'pre-wrap',
						})}
					>
						{report.userNote || 'No note provided.'}
					</Text>
				</Stack>

				<Divider />

				{/* Admin Actions */}
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

const StatusSelect = ({ report }: { report: ReportRecord }) => {
	const apiUtils = api.useUtils()
	const updateMutation = api.report.update.useMutation({
		onSuccess: () => apiUtils.report.forReportsTable.invalidate(),
	})

	return (
		<Select
			data={[
				{ value: ReportStatus.PENDING, label: 'Pending' },
				{ value: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
				{ value: ReportStatus.RESOLVED, label: 'Resolved' },
			]}
			value={report.status}
			onChange={(val) => updateMutation.mutate({ id: report.id, status: val as ReportStatus })}
			size='xs'
			sx={{ width: rem(130) }}
		/>
	)
}

const BottomBar = ({ table }: { table: MRT_TableInstance<ReportRecord> }) => {
	const { classes } = useStyles()
	const filteredRowCount = table.getFilteredRowModel().rows.length
	const preFilteredRowCount = table.getPreFilteredRowModel().rows.length

	return (
		<div className={classes.bottomBar}>
			<Text variant='utility3'>
				{preFilteredRowCount !== filteredRowCount
					? `Showing ${filteredRowCount} of ${preFilteredRowCount} results`
					: `${preFilteredRowCount} results`}
			</Text>
		</div>
	)
}

// --- Main Table Component ---

export const ReportTable = () => {
	const { classes, theme } = useStyles()
	const variants = useCustomVariant()
	const router = useRouter()
	const { reportId } = router.query

	const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
	const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)

	// Clean up the URL when the modal is closed to prevent it from re-opening on refresh
	// and to allow the table to reset to the full list.
	const handleCloseDetails = useCallback(() => {
		closeDetails()
		if (router.query.reportId) {
			const { reportId: _removed, ...query } = router.query
			router.replace({ query }, undefined, { shallow: true })
		}
	}, [closeDetails, router])

	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<MRT_SortingState>([{ id: 'createdAt', desc: true }])
	const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>({})

	const rowVirtualizerInstanceRef = useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null)

	useEffect(() => {
		try {
			rowVirtualizerInstanceRef.current?.scrollToIndex(0)
		} catch (e) {
			console.error(e)
		}
	}, [sorting])

	const { data, isLoading, isError, isFetching } = api.report.forReportsTable.useQuery(
		router.isReady && reportId ? { id: reportId as string } : undefined,
		{
			enabled: router.isReady,
			refetchOnWindowFocus: false,
		}
	)

	useEffect(() => {
		if (router.isReady && reportId && data?.length) {
			const report = data.find((r) => r.id === reportId)
			// Only trigger if a matching report is found and the details aren't already visible
			if (report && !detailsOpened && selectedReport?.id !== report.id) {
				setSelectedReport(report)
				openDetails()
			}
		}
	}, [router.isReady, reportId, data, openDetails, detailsOpened, selectedReport?.id])

	const columns = useMemo<MRT_ColumnDef<ReportRecord>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableColumnFilter: false,
				size: 90,
			},
			{
				id: 'target',
				header: 'Reported Item',
				accessorFn: (row) => row.serviceNameSnapshot || row.orgNameSnapshot,
				size: 250,
				Cell: ({ row }) => {
					const isResolved = row.original.status === ReportStatus.RESOLVED
					return (
						<Stack spacing={0}>
							<Text
								weight={500}
								size='sm'
								variant={isResolved ? variants.Text.utility4darkGray : variants.Text.utility4}
							>
								{row.original.serviceNameSnapshot || row.original.orgNameSnapshot}
							</Text>
							<Text size='xs' color='dimmed' italic>
								{row.original.serviceId
									? `ID: ${row.original.serviceId}`
									: `ID: ${row.original.organizationId}`}
							</Text>
						</Stack>
					)
				},
			},
			{
				accessorKey: 'issueType',
				header: 'Issue Type',
				size: 150,
				filterVariant: 'multi-select',
			},
			{
				accessorKey: 'status',
				header: 'Status',
				size: 150,
				Cell: ({ row }) => <StatusSelect report={row.original} />,
				filterVariant: 'select',
			},
			{
				accessorKey: 'createdAt',
				header: 'Submitted',
				size: 150,
				Cell: ({ cell }) => {
					const date = DateTime.fromJSDate(cell.getValue<Date>())
					return (
						<Tooltip label={date.toLocaleString(DateTime.DATETIME_SHORT)} withinPortal>
							<span>{date.toRelativeCalendar()}</span>
						</Tooltip>
					)
				},
				sortingFn: 'datetime',
			},
		],
		[variants]
	)

	const table = useMantineReactTable({
		columns,
		data: data ?? [],
		enableColumnResizing: true,
		enableFacetedValues: true,
		enablePinning: true,
		enableRowActions: true,
		enableRowVirtualization: true,
		enablePagination: false,
		enableGlobalFilterModes: true,
		positionGlobalFilter: 'left',
		columnFilterDisplayMode: 'popover',

		initialState: {
			columnPinning: { left: ['mrt-row-actions'] },
			columnVisibility: { id: false },
			showGlobalFilter: true,
		},

		state: {
			columnFilters,
			columnFilterFns,
			globalFilter,
			sorting,
			isLoading,
			showAlertBanner: isError || isFetching || isLoading,
			showProgressBars: isFetching,
			density: 'xs',
		},

		mantinePaperProps: { miw: '85%' },
		mantineTableContainerProps: { mah: '60vh' },
		mantineTableProps: { striped: true },
		mantineTableBodyCellProps: ({ row }) => ({
			sx: (theme) => ({
				color:
					row.original.status === ReportStatus.RESOLVED ? theme.other.colors.secondary.darkGray : undefined,
			}),
		}),

		mantineSearchTextInputProps: {
			placeholder: 'Search Reports',
			icon: null,
			sx: {
				width: rem(300),
				'& .mantine-ActionIcon-root': {
					backgroundColor: theme.colors.green[6],
					color: theme.white,
					borderRadius: theme.radius.sm,
					'&:hover': { backgroundColor: theme.colors.green[7] },
				},
			},
		},

		renderToolbarInternalActions: ({ table }) => (
			<Group spacing='xs'>
				<MRT_ToggleFiltersButton table={table} />
				<MRT_ShowHideColumnsButton table={table} />
			</Group>
		),
		renderBottomToolbar: ({ table }) => <BottomBar table={table} />,
		renderRowActions: ({ row }) => {
			const editUrl: Route = {
				pathname: '/org/[slug]/edit',
				query: { slug: row.original.organization.slug },
			}

			return (
				<Group noWrap spacing={8}>
					<Tooltip label='View Details' withinPortal>
						<ActionIcon
							onClick={() => {
								setSelectedReport(row.original)
								openDetails()
							}}
						>
							<Icon icon='carbon:search' />
						</ActionIcon>
					</Tooltip>
					<Tooltip label='Edit Target' withinPortal>
						<ActionIcon
							component={Link}
							href={editUrl}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-expect-error ignore blank target error
							target='_blank'
						>
							<Icon icon='carbon:edit' />
						</ActionIcon>
					</Tooltip>
				</Group>
			)
		},

		onColumnFiltersChange: setColumnFilters,
		onColumnFilterFnsChange: setColumnFilterFns,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
	})

	return (
		<>
			<MantineReactTable table={table} />
			{selectedReport && (
				<ReportDetailsModal report={selectedReport} opened={detailsOpened} onClose={handleCloseDetails} />
			)}
		</>
	)
}
