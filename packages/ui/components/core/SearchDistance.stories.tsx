import { type Meta, type StoryObj } from '@storybook/nextjs'

import { SearchDistance } from './SearchDistance'

export default {
	title: 'Design System/Search Distance Slider',
	component: SearchDistance,
	parameters: {
		searchContext: {
			params: ['dist', '-77.0368707', '38.9071923', '50', 'mi'],
			a: [],
			page: '1',
			s: [],
		},
		nextjs: {
			router: {
				pathname: '/search/[...params]',
				asPath: 'search/dist/-77.0368707/38.9071923/50/mi?page=1',
				query: {
					params: ['dist', '-77.0368707', '38.9071923', '50', 'mi'],
					page: '1',
				},
			},
		},
		// layout: 'fullscreen',
		// layoutWrapper: 'centeredHalf',

		// See docs/Testing/search-test-inventory.md §12, case 12.3. The `render` wrapper below
		// hardcodes a fixed 300px width, so this component's own layout won't visibly reflow
		// across these - kept for consistency with the other three search stories this case
		// covers, and in case that fixed width is ever removed.
		chromatic: { viewports: [500, 768, 1024, 1440] },
	},
	render: () => (
		<div style={{ width: '300px' }}>
			<SearchDistance />
		</div>
	),
} satisfies Meta<typeof SearchDistance>

type StoryDef = StoryObj<typeof SearchDistance>

export const Default = {} satisfies StoryDef

export const WithRemoteIncluded = {
	parameters: {
		nextjs: {
			router: {
				pathname: '/search/[...params]',
				asPath: 'search/dist/-77.0368707/38.9071923/50/mi?page=1&extended=true',
				query: {
					params: ['dist', '-77.0368707', '38.9071923', '50', 'mi'],
					page: '1',
					extended: 'true',
				},
			},
		},
	},
} satisfies StoryDef
