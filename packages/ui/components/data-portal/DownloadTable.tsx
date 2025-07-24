import { Group, Stack, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { CsvDownload } from '~ui/components/data-portal/CsvDownload'
import { trpc as api } from '~ui/lib/trpcClient'

// Define the props interface for your DownloadTable
export interface DownloadTableProps {
	// Add any props your table will eventually need here, e.g.:
	// data: any[];
	// isLoading: boolean;
	// onDownload: (type: string) => void;
}

export const DownloadTable = (props: DownloadTableProps) => {
	const { t } = useTranslation('common') // Use translation for the title

	return (
		<Stack>
			<Title order={3}>{t('user-menu.csv-downloads')}</Title>
			<Group noWrap spacing={8}>
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
			</Group>
		</Stack>
	)
}
