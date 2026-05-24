import { Button, Divider, Skeleton, Stack, Switch, Text, Title } from '@mantine/core'
import { useRouter } from 'next/router'
import React from 'react'

import { trackSearchV2Action } from './search-v2-analytics-tracker'

/**
 * DRAFT UI BLUEPRINT: SearchResultSidebarV2 This component introduces the explicit "Update Results" trigger
 * and the entry point for search fine-tuning.
 */
export const SearchResultSidebarV2 = ({
	resultCount,
	isLoading,
}: {
	resultCount?: number
	isLoading: boolean
}) => {
	const router = useRouter()

	const handleUpdate = () => {
		trackSearchV2Action('search_v2_applied', { source: 'sidebar' })

		if (typeof window !== 'undefined') {
			// Switch the engine to V2
			localStorage.setItem('ir_search_version', 'v2')

			// Navigate to the V2 route if not already there
			if (!router.pathname.includes('/v2')) {
				const nextPathname = router.pathname.replace('/search', '/search/v2')
				router.push({ pathname: nextPathname as never, query: router.query })
			}
		}
	}

	return (
		<Stack spacing={32} maw={300}>
			<Skeleton visible={typeof resultCount !== 'number'}>
				<Text weight={700}>{resultCount} Results Found</Text>
			</Skeleton>

			<Title order={3}>Community Focus</Title>
			<Stack spacing={10}>
				<Switch label='BIPOC Focused' />
				<Switch label='Youth Focused' />
				{/* ... other focuses ... */}
			</Stack>

			<Button variant='outline' fullWidth onClick={() => trackSearchV2Action('advanced_search_opened', {})}>
				Tune Search Priority
			</Button>

			<Divider />

			<Button variant='filled' fullWidth loading={isLoading} onClick={handleUpdate}>
				Update Results
			</Button>
		</Stack>
	)
}
