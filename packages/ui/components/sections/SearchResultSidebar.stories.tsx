import { type Meta } from '@storybook/nextjs'

import { StorybookGridSingle } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { attribute } from '~ui/mockData/attribute'

import { SearchResultSidebar } from './SearchResultSidebar'

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
