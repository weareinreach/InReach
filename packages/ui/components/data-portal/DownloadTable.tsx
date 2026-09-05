import { Text } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { type UseMutationResult } from '@tanstack/react-query'
import { type ExpandedState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'

import { type Permission } from '@weareinreach/db/generated/permission'
import { CsvDownload } from '~ui/components/data-portal/CsvDownload'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'

interface DownloadRow {
	id: string
	section: string
	label: string
	fileName: string
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	useMutationHook: (options?: any) => UseMutationResult<any, any, void, any>
	permissionKey?: Permission | Permission[]
}

/**
 * A synthetic parent row, one per `section` - lets the shared `DataTable`'s sub-row expansion (the same
 * mechanism `OrganizationTable` uses for an org's locations) group reports the way the old hand-rolled
 * section headers did, while actually rendering through the standard Actions/Name column layout.
 */
interface DownloadSection {
	id: string
	label: string
	children: DownloadRow[]
}

type DownloadTableRow = DownloadSection | DownloadRow

const isSectionRow = (row: DownloadTableRow): row is DownloadSection => 'children' in row

// The reports themselves stay exactly as they were (same label/fileName/mutation hook/permission per
// report) - there's no need for column sort/pagination over 14 fixed, hand-authored rows.
const DOWNLOAD_ROWS: DownloadRow[] = [
	{
		id: 'all-published-orgs',
		section: 'Published/Unpublished Lists',
		label: 'All Published Organizations',
		fileName: 'all_published_organizations',
		useMutationHook: () => api.csvDownload.getAllPublishedForCSV.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'all-unpublished-orgs',
		section: 'Published/Unpublished Lists',
		label: 'All Unpublished Organizations',
		fileName: 'all_unpublished_organizations',
		useMutationHook: () => api.csvDownload.getAllUnpublishedForCSV.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'all-orgs-with-reviews',
		section: 'Review Lists',
		label: 'All Orgs with Reviews (Published and Unpublished)',
		fileName: 'all_orgs_with_reviews',
		useMutationHook: () => api.csvDownload.getOrgsWithReviews.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'org-services-california',
		section: 'Organization Counts',
		label: 'Published Organizations & Services in California',
		fileName: 'count_of_org_services_in_california',
		useMutationHook: () => api.csvDownload.getPublishedOrgServicesCalifornia.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'org-count-by-country-attribute',
		section: 'Organization Counts',
		label: 'Published Organizations By Country & Attribute',
		fileName: 'count_of_org_by_country_attribute',
		useMutationHook: () => api.csvDownload.getOrgCountByCountryAttribute.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'org-count-by-country',
		section: 'Organization Counts',
		label: 'Published Organizations By Country',
		fileName: 'count_of_org_by_country',
		useMutationHook: () => api.csvDownload.getOrgCountByCountry.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'org-count-by-country-state',
		section: 'Organization Counts',
		label: 'Published Organizations By Country & State',
		fileName: 'count_of_org_by_country_state',
		useMutationHook: () => api.csvDownload.getOrgCountByState.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-category-california',
		section: 'Service Counts',
		label: 'Published Services By Category in California',
		fileName: 'count_of_services_by_category_in_california',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryCalifornia.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-category-country',
		section: 'Service Counts',
		label: 'Published Services By Category & Country',
		fileName: 'count_of_services_by_category_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryCountry.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-category-state-country',
		section: 'Service Counts',
		label: 'Published Services By Category, State, & Country',
		fileName: 'count_of_services_by_category_state_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryStateCountry.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-country-state-zip',
		section: 'Service Counts',
		label: 'Published Services By Country & State & Postal Code',
		fileName: 'count_of_services_by_category_zipcode_state_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryStatePostalCode.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-attribute-country',
		section: 'Service Counts',
		label: 'Published Services By Attribute & Country',
		fileName: 'count_of_services_by_attribute_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryAttribute.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-country',
		section: 'Service Counts',
		label: 'Published Services By Country',
		fileName: 'count_of_services_by_country',
		useMutationHook: () => api.csvDownload.getServiceCountByCountry.useMutation(),
		permissionKey: 'dataPortalManager',
	},
	{
		id: 'services-by-country-state',
		section: 'Service Counts',
		label: 'Published Services By Country & State',
		fileName: 'count_of_services_by_country_state',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryState.useMutation(),
		permissionKey: 'dataPortalManager',
	},
]

const getDownloadTableSubRows = (row: DownloadTableRow): DownloadTableRow[] | undefined =>
	isSectionRow(row) ? row.children : undefined

/**
 * Cell renderer for the 'actions' column - a section (parent) row has no download of its own, only its
 * children do.
 */
const ActionsCell = ({ row }: DataTableCellContext<DownloadTableRow>) => {
	if (isSectionRow(row)) {
		return null
	}
	return (
		<CsvDownload
			label={row.label}
			fileName={row.fileName}
			useMutationHook={row.useMutationHook}
			permissionKey={row.permissionKey}
		/>
	)
}

/** Cell renderer for the 'name' column - bolds the section header, plain text for each report. */
const NameCell = ({ row }: DataTableCellContext<DownloadTableRow>) =>
	isSectionRow(row) ? <Text fw={600}>{row.label}</Text> : <Text size='sm'>{row.label}</Text>

const EMPTY_SORTING: SortingState = []
const noopSortingChange = () => undefined
const PAGINATION: PaginationState = { pageIndex: 0, pageSize: DOWNLOAD_ROWS.length }
const noopPaginationChange = () => undefined

export const DownloadTable = () => {
	const { data: session } = useSession()

	const [search, setSearch] = useState('')
	const [debouncedSearch] = useDebouncedValue(search, 300)
	const [expanded, setExpanded] = useState<ExpandedState>(true)

	const userPerms = session?.user?.permissions || []
	const canViewDownloads = userPerms.some((p) =>
		['root', 'sysadmin', 'system', 'dataPortalAdmin', 'dataPortalManager'].includes(p)
	)

	const sections = useMemo<DownloadTableRow[]>(() => {
		const query = debouncedSearch.trim().toLowerCase()
		const filtered = query
			? DOWNLOAD_ROWS.filter(
					(row) => row.label.toLowerCase().includes(query) || row.section.toLowerCase().includes(query)
				)
			: DOWNLOAD_ROWS
		const bySection = new Map<string, DownloadRow[]>()
		for (const row of filtered) {
			const rows = bySection.get(row.section) ?? []
			rows.push(row)
			bySection.set(row.section, rows)
		}
		return [...bySection.entries()].map(([section, rows]) => ({
			id: `section-${section}`,
			label: section,
			children: rows,
		}))
	}, [debouncedSearch])

	const columns = useMemo<DataTableColumn<DownloadTableRow>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 80,
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
				size: 600,
				enableSorting: false,
				accessorFn: (row) => row.label,
				cell: NameCell,
			},
		],
		[]
	)

	if (!canViewDownloads) return null

	return (
		<DataTable
			data={sections}
			columns={columns}
			getSubRows={getDownloadTableSubRows}
			expanded={expanded}
			onExpandedChange={setExpanded}
			sorting={EMPTY_SORTING}
			onSortingChange={noopSortingChange}
			globalFilter={search}
			onGlobalFilterChange={setSearch}
			globalFilterPlaceholder='Search Reports'
			pagination={PAGINATION}
			onPaginationChange={noopPaginationChange}
			mode={{ serverSide: true, rowCount: sections.length }}
			showFooter={false}
			emptyMessage='No results'
		/>
	)
}
