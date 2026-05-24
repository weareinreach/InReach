import { Button, Group, Modal, SegmentedControl, Slider, Stack, Switch, Text, Title } from '@mantine/core'
import { useRouter } from 'next/router'
import React from 'react'

import { trackSearchV2Action } from './search-v2-analytics-tracker'

/**
 * DRAFT UI BLUEPRINT: AdvancedSearchModal Provides the "Pilot" controls for the weighted relevance engine.
 */
export const AdvancedSearchModal = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
	const router = useRouter()

	const handleApply = () => {
		trackSearchV2Action('search_v2_applied', { source: 'modal' })

		if (typeof window !== 'undefined') {
			// Commit to V2 Engine
			localStorage.setItem('ir_search_version', 'v2')

			// Transition route
			const nextPathname = router.pathname.includes('/v2')
				? router.pathname
				: router.pathname.replace('/search', '/search/v2')

			router.push({ pathname: nextPathname as never, query: router.query })
		}
		onClose()
	}

	return (
		<Modal
			opened={opened}
			onClose={() => {
				trackSearchV2Action('advanced_search_closed', { applied: false })
				onClose()
			}}
			title={<Title order={2}>Advanced Search Settings</Title>}
			size='lg'
		>
			<Stack spacing={24}>
				<section>
					<Text weight={700} mb={8}>
						Search Logic
					</Text>
					<SegmentedControl
						fullWidth
						data={[
							{ label: 'Match All (AND)', value: 'AND' },
							{ label: 'Match Any (OR)', value: 'OR' },
						]}
					/>
					<Text size='xs' color='dimmed' mt={4}>
						"Match Any" ensures you see results even if they don't match every single filter.
					</Text>
				</section>

				<section>
					<Text weight={700} mb={8}>
						Sorting Preference
					</Text>
					<SegmentedControl
						fullWidth
						data={[
							{ label: 'Closest (Distance)', value: 'DISTANCE' },
							{ label: 'Best Match (Relevance)', value: 'RELEVANCE' },
						]}
					/>
				</section>

				<section>
					<Text weight={700} mb={8}>
						Maximum Distance (miles)
					</Text>
					<Slider
						min={1}
						max={200}
						defaultValue={50}
						marks={[
							{ value: 50, label: '50m' },
							{ value: 200, label: '200m' },
						]}
					/>
				</section>

				<Switch label='Include National & Remote Resources' />

				<section>
					<Text weight={700} mb={4}>
						Priority Ranking (1-N)
					</Text>
					<Text size='sm' color='dimmed'>
						Rank your selected focus items by importance. Rank 1 gets the strongest "bubble" boost.
					</Text>
					{/* TODO: Implement Draggable List or Priority Selectors based on sidebar state */}
					<Group mt={10}>[ Priority List Placeholder ]</Group>
				</section>

				<Button fullWidth size='lg' onClick={handleApply}>
					Apply Settings
				</Button>
			</Stack>
		</Modal>
	)
}
