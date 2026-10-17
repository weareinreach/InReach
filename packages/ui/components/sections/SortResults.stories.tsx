import { type Meta, type StoryObj } from '@storybook/nextjs'
import { expect, userEvent, within } from 'storybook/test'

import { StorybookGridSingle } from '~ui/layouts'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { attribute } from '~ui/mockData/attribute'

import { SortResults } from './SortResults'

// Same mock as SearchResultSidebar.stories.tsx - SortResults renders SearchResultSidebar
// internally (in `onlySort` mode) once its drawer opens, so it needs the same
// `getCommunityFocusOptions` data to have anything to show.
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
	],
})

export default {
	title: 'Sections/Sort Results',
	component: SortResults,
	decorators: [StorybookGridSingle],

	beforeEach({ msw }) {
		msw.use(attribute.getFilterOptions, getCommunityFocusOptions)
	},

	parameters: {
		layout: 'fullscreen',
	},

	args: {
		resultCount: 50,
		loadingManager: { isLoading: false, setLoading: () => {} },
		children: 'Sort results',
	},
} satisfies Meta<typeof SortResults>

type Story = StoryObj<typeof SortResults>

// No Storybook story file existed at all for this component before this - Chromatic had zero
// coverage of any state, not even the default closed button. See
// docs/Testing/search-test-inventory.md §10, case 10.4.
export const Closed: Story = {}

/**
 * `SortResults` manages its drawer's open/closed state internally (`useDisclosure`, no external `opened` prop
 * to set via args, unlike most other Drawer-wrapping components in this codebase) - a `play` function is the
 * only way to reach and snapshot the open state.
 */
export const Open: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Sort results' }))
		// `toBeInTheDocument`, not `toBeVisible`: the Drawer's `Stack h='calc(100vh - 80px)'`
		// resolves against the test-runner's small iframe viewport, which can make Playwright's
		// actual-rendered-size visibility check read as "not visible" here even though the drawer
		// genuinely opened - confirmed real drawer content in the DOM is enough to prove the
		// interaction worked; Chromatic's own visual snapshot is what actually protects the
		// rendered look, not this assertion.
		const body = within(canvasElement.ownerDocument.body)
		await expect(body.findByRole('button', { name: 'View 50 results' })).resolves.toBeInTheDocument()
	},
}
