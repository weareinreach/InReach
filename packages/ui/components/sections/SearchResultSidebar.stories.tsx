import { type Meta, type StoryFn } from '@storybook/nextjs'
import { setCookie } from 'cookies-next'
import { type ComponentType } from 'react'

import { StorybookGridSingle } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { attribute } from '~ui/mockData/attribute'

import { SearchResultSidebar } from './SearchResultSidebar'

/**
 * Seeds an active-focus cookie before the story mounts, so the sidebar actually renders one selected switch
 * (SearchResultSidebar.tsx reads this cookie in a mount-time `useEffect`) - same shape as
 * `.storybook/decorators/SearchState.tsx`'s `WithSearchState`, but this component has no search-state context
 * dependency here, only a plain cookie.
 */
const WithActiveFocusCookie = (Story: StoryFn) => {
	setCookie('ir_active_focuses', JSON.stringify(['attr_MOCKBIPOC00000001']))
	const StoryComponent = Story as ComponentType
	return <StoryComponent />
}
WithActiveFocusCookie.displayName = 'WithActiveFocusCookie'

// This story never had a mock for the sidebar's own `getCommunityFocusOptions` query, so the hook
// result was always `undefined` here - the tags below match SIDEBAR_TAG_CONFIG's keys so the
// sidebar actually has something to render, not just avoid crashing.
const getCommunityFocusOptions = getTRPCMock({
	path: ['organization', 'getCommunityFocusOptions'],
	type: 'query',
	response: [
		{
			id: 'attr_MOCKBIPOC00000001',
			tag: 'bipoc-comm',
			tsNs: 'attribute',
			tsKey: 'srvfocus.bipoc',
			icon: null,
		},
		{ id: 'attr_MOCKHIV000000001', tag: 'hiv-comm', tsNs: 'attribute', tsKey: 'srvfocus.hiv', icon: null },
		{
			id: 'attr_MOCKIMMIGRANT0001',
			tag: 'immigrant-comm',
			tsNs: 'attribute',
			tsKey: 'srvfocus.immigrants',
			icon: null,
		},
		{
			id: 'attr_MOCKTRANS000001',
			tag: 'trans-comm',
			tsNs: 'attribute',
			tsKey: 'srvfocus.transgender',
			icon: null,
		},
	],
})

export default {
	title: 'Sections/Search Result Sidebar',
	component: SearchResultSidebar,
	decorators: [StorybookGridSingle],

	beforeEach({ msw }) {
		msw.use(attribute.getFilterOptions, getCommunityFocusOptions)
	},

	parameters: {
		layout: 'fullscreen',
		// See docs/Testing/search-test-inventory.md §12, case 12.3. The component itself caps its
		// own width (`maw={300}` on the root Stack, SearchResultSidebar.tsx) and this story
		// doesn't include the real page's surrounding `Grid.Col` - so this mainly protects the
		// `StorybookGridSingle` decorator layout at each width, not a column-width shift.
		chromatic: { viewports: [500, 768, 1024, 1440] },
	},

	args: {
		resultCount: 50,
		// This story never passed loadingManager - it's a required prop, so the sidebar crashed
		// reading `.isLoading` off of undefined. setLoading is a no-op since this story doesn't need
		// to observe loading state changes.
		loadingManager: {
			isLoading: false,
			setLoading: () => {},
		},
	},
} satisfies Meta<typeof SearchResultSidebar>

export const Default = {}

/**
 * `isAdvanced` defaults to `false` (the "coming soon" overlay state, only actually reachable via
 * `intl/index.tsx`) - before this story, `Default` was the ONLY story, so Chromatic never protected
 * `isAdvanced: true`, the state real users see on every normal search results page. The
 * `WithActiveFocusCookie` decorator seeds an active focus cookie before mount, without which `isAdvanced:
 * true` alone would still render every switch unselected - so this is also the first story to protect
 * `SortableFocusSwitch`'s drag-handle icon, which only shows on a selected switch. See
 * docs/Testing/search-test-inventory.md §9, cases 9.9/9.10.
 */
export const AdvancedWithActiveFocus = {
	args: { isAdvanced: true },
	decorators: [WithActiveFocusCookie],
}
