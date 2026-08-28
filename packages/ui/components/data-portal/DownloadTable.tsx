import { Divider, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { type UseMutationResult } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { useMemo, useState } from 'react'

import { type Permission } from '@weareinreach/db/generated/permission'
import { CsvDownload } from '~ui/components/data-portal/CsvDownload'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

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
// per report), grouped by `section` into a header + list rather than a generic sortable/filterable
// table - there's no need for column sort/pagination over 14 fixed, hand-authored rows, and a flat
// "Section" column made the grouping harder to scan than an actual section header would.
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

export const DownloadTable = () => {
	const { t } = useTranslation('common')
	const { data: session } = useSession()

	const [search, setSearch] = useState('')
	const [debouncedSearch] = useDebouncedValue(search, 300)

	const userPerms = session?.user?.permissions || []
	const canViewDownloads = userPerms.some((p) =>
		['root', 'sysadmin', 'system', 'dataPortalAdmin'].includes(p)
	)

	const sections = useMemo(() => {
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
		return [...bySection.entries()]
	}, [debouncedSearch])

	if (!canViewDownloads) return null

	return (
		<Stack>
			<Text size='16px' fw={500}>
				{t('user-menu.csv-downloads')}
			</Text>
			<TextInput
				placeholder='Search Reports'
				value={search}
				onChange={(event) => setSearch(event.currentTarget.value)}
				leftSection={<Icon icon='carbon:search' height={16} />}
				w={280}
			/>
			{sections.length === 0 && (
				<Text c='dimmed' ta='center' py='md'>
					No results
				</Text>
			)}
			{sections.map(([section, rows]) => (
				<Stack key={section} gap='xs'>
					<Title order={4}>{section}</Title>
					<Stack gap={0}>
						{rows.map((row, index) => (
							<div key={row.id}>
								{index > 0 && <Divider />}
								<Group justify='space-between' wrap='nowrap' py='xs'>
									<Text size='sm'>{row.label}</Text>
									<CsvDownload
										label={row.label}
										fileName={row.fileName}
										useMutationHook={row.useMutationHook}
										permissionKey={row.permissionKey}
									/>
								</Group>
							</div>
						))}
					</Stack>
				</Stack>
			))}
		</Stack>
	)
}
