import { Group, SimpleGrid, Stack, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { CsvDownload } from '~ui/components/data-portal/CsvDownload'
import { trpc as api } from '~ui/lib/trpcClient'

export interface DownloadTableProps {
	// Add any props your table will eventually need here
}

export const DownloadTable = (props: DownloadTableProps) => {
	const { t } = useTranslation('common')

	return (
		<Stack spacing='xl'>
			<Title order={2}>{t('user-menu.csv-downloads')}</Title>

			<Stack spacing='md'>
				<Title order={3}>Published/Unpublished Lists</Title>
				<SimpleGrid cols={3}>
					<CsvDownload
						label='All Published Organizations'
						fileName='all_published_organizations'
						useMutationHook={() => api.csvDownload.getAllPublishedForCSV.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='All Unpublished Organizations'
						fileName='all_unpublished_organizations'
						useMutationHook={() => api.csvDownload.getAllUnpublishedForCSV.useMutation()}
						permissionKey='dataPortalManager'
					/>
				</SimpleGrid>
			</Stack>

			<Stack spacing='md'>
				<Title order={3}>Review Lists</Title>
				<SimpleGrid cols={3}>
					<CsvDownload
						label='All Orgs with Reviews (Published and Unpublished)'
						fileName='all_orgs_with_reviews'
						useMutationHook={() => api.csvDownload.getOrgsWithReviews.useMutation()}
						permissionKey='dataPortalManager'
					/>
				</SimpleGrid>
			</Stack>

			<Stack spacing='md'>
				<Title order={3}>Organization Counts</Title>
				<SimpleGrid cols={3}>
					<CsvDownload
						label='Published Organizations & Services in California'
						fileName='count_of_org_services_in_california'
						useMutationHook={() => api.csvDownload.getPublishedOrgServicesCalifornia.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Organizations By Country'
						fileName='count_of_org_by_country'
						useMutationHook={() => api.csvDownload.getOrgCountByCountry.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Organizations By Country & Attribute'
						fileName='count_of_org_by_country_attribute'
						useMutationHook={() => api.csvDownload.getOrgCountByCountryAttribute.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Organizations By Country & State'
						fileName='count_of_org_by_country_state'
						useMutationHook={() => api.csvDownload.getOrgCountByState.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Organizations By Country & State'
						fileName='count_of_org_by_country_state'
						useMutationHook={() => api.csvDownload.getOrgCountByState.useMutation()}
						permissionKey='dataPortalManager'
					/>
				</SimpleGrid>
			</Stack>

			<Stack spacing='md'>
				<Title order={3}>Service Counts</Title>
				<SimpleGrid cols={3}>
					<CsvDownload
						label='Published Services By Country'
						fileName='count_of_services_by_country'
						useMutationHook={() => api.csvDownload.getServiceCountByCountry.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Services By Category in California'
						fileName='count_of_services_by_category_in_california'
						useMutationHook={() => api.csvDownload.getServicesCountByCategoryCalifornia.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Services By Category & Country'
						fileName='count_of_services_by_category_country'
						useMutationHook={() => api.csvDownload.getServicesCountByCategoryCountry.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Services By Attribute & Country'
						fileName='count_of_services_by_attribute_country'
						useMutationHook={() => api.csvDownload.getServicesCountByCountryAttribute.useMutation()}
						permissionKey='dataPortalManager'
					/>
					<CsvDownload
						label='Published Services By Country & State'
						fileName='count_of_services_by_country_state'
						useMutationHook={() => api.csvDownload.getServicesCountByCountryState.useMutation()}
						permissionKey='dataPortalManager'
					/>
				</SimpleGrid>
			</Stack>
		</Stack>
	)
}
