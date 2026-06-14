import { Button, Drawer, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { type Dispatch, type SetStateAction } from 'react'

import { SearchResultSidebar } from './SearchResultSidebar'

export const SortResults = ({ resultCount, loadingManager, children, disabled }: SortResultsProps) => {
	const { t } = useTranslation('common')
	const [opened, { open, close }] = useDisclosure(false)

	return (
		<>
			<Button onClick={open} variant='outline' fullWidth my={16} disabled={disabled}>
				{children}
			</Button>
			<Drawer
				opened={opened}
				onClose={close}
				padding='xl'
				size='xl'
				title={t('sort.results')}
				position='right'
				withCloseButton={false}
			>
				<Stack justify='space-between' h='calc(100vh - 80px)' align='center'>
					<SearchResultSidebar
						resultCount={resultCount}
						loadingManager={loadingManager}
						isAdvanced={true}
						onlySort
					/>
					<Button onClick={close} variant='primary' fullWidth>
						{t('view-x-result', { count: resultCount })}
					</Button>
				</Stack>
			</Drawer>
		</>
	)
}

interface SortResultsProps {
	resultCount: number
	loadingManager: { setLoading: Dispatch<SetStateAction<boolean>>; isLoading: boolean }
	children: React.ReactNode
	disabled?: boolean
}
