import { type Meta } from '@storybook/nextjs'
import { useEffect, useState } from 'react'
import { action } from 'storybook/actions'

import { WithSearchState } from '~ui/.storybook/decorators/SearchState'
import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { attribute } from '~ui/mockData/attribute'

import { MoreFilter, type MoreFilterProps } from './MoreFilter'

const MoreFilterWrapper = (args: MoreFilterProps) => {
	const [filter, _setFilter] = useState<string[]>([])
	useEffect(() => {
		action('Set service filter')(filter)
	}, [filter])
	// @ts-expect-error I don't know why - but I'm over it.
	return <MoreFilter {...args} />
}

export default {
	title: 'Modals/More Filter',
	component: MoreFilterWrapper,

	beforeEach({ msw }) {
		msw.use(attribute.getFilterOptions)
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

	// render: function Render(args) {
	// 	const [filter, _setFilter] = useState<string[]>([])
	// 	useEffect(() => {
	// 		action('Set service filter')(filter)
	// 	}, [filter])
	// 	return <MoreFilter {...args} />
	// },
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof MoreFilterWrapper>

export const MoreFilterExample = {}

/**
 * With an attribute pre-selected, so the count badge (same `.count` class as ServiceFilter - white text,
 * black circle) actually renders for Chromatic to snapshot. Unlike ServiceFilter, `MoreFilter` has no direct
 * "current selections" prop - it reads `searchState.attributes` via `useSearchState()`, so this needs the
 * `WithSearchState` decorator seeding the provider, rather than an `args` override. See
 * docs/Testing/search-test-inventory.md §8, case 8.6.
 */
export const MoreFilterWithSelections = {
	decorators: [WithSearchState],
	parameters: {
		// additional.has-confidentiality-policy (INCLUDE) - a real id from
		// mockData/json/attribute.getFilterOptions.json. Raw provider state uses the short keys
		// (`a`/`s`), not the `attributes`/`services` names exposed by the `useSearchState()` hook.
		searchContext: { params: [], a: ['attr_01GW2HHFV3BADK80TG0DXXFPMM'] },
	},
}
