import { type Meta } from '@storybook/nextjs'
import { useEffect, useState } from 'react'
import { action } from 'storybook/actions'

import { WithSearchState } from '~ui/.storybook/decorators/SearchState'
import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { service } from '~ui/mockData/service'

import { ServiceFilter } from './index'

export default {
	title: 'Modals/Service Filter',
	component: ServiceFilter,

	beforeEach({ msw }) {
		msw.use(service.getFilterOptions)
	},

	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},

		layout: 'fullscreen',
	},

	args: {
		resultCount: 25,
	},

	decorators: [StorybookGridDouble],

	render: function Render(args) {
		const [filter, _setFilter] = useState<string[]>([])
		useEffect(() => {
			action('Set service filter')(filter)
		}, [filter])

		return <ServiceFilter {...args} />
	},
} satisfies Meta<typeof ServiceFilter>

export const ServiceFilterExample = {}

/**
 * With a service pre-selected, so the count badge (white text, black circle - `.count` in index.tsx) actually
 * renders somewhere for Chromatic to snapshot. Before this story existed, `ServiceFilterExample` was the only
 * story and never had anything selected, so a library update silently breaking the badge's appearance would
 * have passed every check that existed - see docs/Testing/search-test-inventory.md §7, case 7.8, for the
 * wider context.
 *
 * `ServiceFilterProps.current` is declared in the type but never actually read by the component (only
 * `resultCount`/`isFetching`/`disabled` are destructured) - real pre-selection comes from
 * `searchState.services` via `useSearchState()` context, same as `MoreFilter`. This needs `WithSearchState`,
 * not an `args` override - confirmed by reading the component, not assumed from the prop's existence in the
 * type.
 */
export const ServiceFilterWithSelections = {
	decorators: [WithSearchState],
	parameters: {
		// abortion-care.abortion-providers - a real id from
		// mockData/json/service.getFilterOptions.json. Raw provider state uses the short key
		// `s` (services), not the `services` name exposed by the `useSearchState()` hook.
		searchContext: { params: [], s: ['svtg_01GSKV6RFRBNC7GFYP76X4YCW1'] },
	},
}
