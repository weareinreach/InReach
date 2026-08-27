import { Stack, Text } from '@mantine/core'
import { type UseMutationResult } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { useMemo, useState } from 'react'

import { type Permission } from '@weareinreach/db/generated/permission'
import { CsvDownload } from '~ui/components/data-portal/CsvDownload'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableColumn } from './DataTable'

interface DownloadRow {
	id: string
	section: string
	label: string
	fileName: string
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	useMutationHook: (options?: any) => UseMutationResult<any, any, void, any>
	permissionKey?: Permission | Permission[]
}

// The reports themselves stay exactly as they were (same label/fileName/mutation hook/permission
// per report) - only reshaped from one hardcoded `<CsvDownload>` per report into rows for the same
// `DataTable` the other data-portal tabs already use, so this tab matches their look/feel
// (toolbar, search, column filter, sorting) without needing the general "query and pull data"
// engine that's explicitly a separate, later effort.
const DOWNLOAD_ROWS: DownloadRow[] = [
	{
		id: 'all-published-orgs',
		section: 'Published/Unpublished Lists',
		label: 'All Published Organizations',
		fileName: 'all_published_organizations',
		useMutationHook: () => api.csvDownload.getAllPublishedForCSV.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'all-unpublished-orgs',
		section: 'Published/Unpublished Lists',
		label: 'All Unpublished Organizations',
		fileName: 'all_unpublished_organizations',
		useMutationHook: () => api.csvDownload.getAllUnpublishedForCSV.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'all-orgs-with-reviews',
		section: 'Review Lists',
		label: 'All Orgs with Reviews (Published and Unpublished)',
		fileName: 'all_orgs_with_reviews',
		useMutationHook: () => api.csvDownload.getOrgsWithReviews.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'org-services-california',
		section: 'Organization Counts',
		label: 'Published Organizations & Services in California',
		fileName: 'count_of_org_services_in_california',
		useMutationHook: () => api.csvDownload.getPublishedOrgServicesCalifornia.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'org-count-by-country-attribute',
		section: 'Organization Counts',
		label: 'Published Organizations By Country & Attribute',
		fileName: 'count_of_org_by_country_attribute',
		useMutationHook: () => api.csvDownload.getOrgCountByCountryAttribute.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'org-count-by-country',
		section: 'Organization Counts',
		label: 'Published Organizations By Country',
		fileName: 'count_of_org_by_country',
		useMutationHook: () => api.csvDownload.getOrgCountByCountry.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'org-count-by-country-state',
		section: 'Organization Counts',
		label: 'Published Organizations By Country & State',
		fileName: 'count_of_org_by_country_state',
		useMutationHook: () => api.csvDownload.getOrgCountByState.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-category-california',
		section: 'Service Counts',
		label: 'Published Services By Category in California',
		fileName: 'count_of_services_by_category_in_california',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryCalifornia.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-category-country',
		section: 'Service Counts',
		label: 'Published Services By Category & Country',
		fileName: 'count_of_services_by_category_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryCountry.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-category-state-country',
		section: 'Service Counts',
		label: 'Published Services By Category, State, & Country',
		fileName: 'count_of_services_by_category_state_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCategoryStateCountry.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-country-state-zip',
		section: 'Service Counts',
		label: 'Published Services By Country & State & Postal Code',
		fileName: 'count_of_services_by_category_zipcode_state_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryStatePostalCode.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-attribute-country',
		section: 'Service Counts',
		label: 'Published Services By Attribute & Country',
		fileName: 'count_of_services_by_attribute_country',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryAttribute.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-country',
		section: 'Service Counts',
		label: 'Published Services By Country',
		fileName: 'count_of_services_by_country',
		useMutationHook: () => api.csvDownload.getServiceCountByCountry.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
	{
		id: 'services-by-country-state',
		section: 'Service Counts',
		label: 'Published Services By Country & State',
		fileName: 'count_of_services_by_country_state',
		useMutationHook: () => api.csvDownload.getServicesCountByCountryState.useMutation(),
		permissionKey: 'dataPortalAdmin',
	},
]

const SECTION_OPTIONS = [...new Set(DOWNLOAD_ROWS.map((row) => row.section))].map((section) => ({
	value: section,
	label: section,
}))

export const DownloadTable = () => {
	const { t } = useTranslation('common')
	const { data: session } = useSession()

	const [sorting, setSorting] = useState<SortingState>([{ id: 'section', desc: false }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const userPerms = session?.user?.permissions || []
	const canViewDownloads = userPerms.some((p) =>
		['root', 'sysadmin', 'system', 'dataPortalAdmin'].includes(p)
	)

	const columns = useMemo<DataTableColumn<DownloadRow>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 70,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: ({ row }) => (
					<CsvDownload
						label={row.label}
						fileName={row.fileName}
						useMutationHook={row.useMutationHook}
						permissionKey={row.permissionKey}
					/>
				),
			},
			{
				id: 'section',
				header: 'Section',
				size: 220,
				filter: { type: 'multi-select', options: SECTION_OPTIONS },
			},
			{ id: 'label', header: 'Report Name' },
		],
		[]
	)

	if (!canViewDownloads) return null

	return (
		<Stack>
			<Text size='16px' fw={500} style={{ marginBottom: '-1rem' }}>
				{t('user-menu.csv-downloads')}
			</Text>
			<DataTable
				data={DOWNLOAD_ROWS}
				getRowId={(row) => row.id}
				columns={columns}
				sorting={sorting}
				onSortingChange={setSorting}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				globalFilterPlaceholder='Search Reports'
				pagination={pagination}
				onPaginationChange={setPagination}
			/>
		</Stack>
	)
}
