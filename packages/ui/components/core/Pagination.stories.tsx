import { type Meta } from '@storybook/nextjs'

import { Pagination } from './Pagination'

export default {
	title: 'Design System/Pagination',
	component: Pagination,
	args: {
		total: 8,
	},
	parameters: {
		nextjs: {
			router: {
				query: {
					page: '1',
				},
			},
		},
	},
} satisfies Meta<typeof Pagination>

export const Default = {}

/**
 * `Default` is pinned to page 1 of 8 - "Prev"-disabled and the left-boundary state are covered there, but
 * "Next"-disabled never rendered in any story before this. See docs/Testing/search-test-inventory.md §11,
 * case 11.5.
 */
export const LastPage = {
	parameters: {
		nextjs: {
			router: {
				query: { page: '8' },
			},
		},
	},
}

/**
 * A middle page (not a start/end boundary) is the only state where both left AND right ellipsis dots show
 * simultaneously (`boundaries: 1, siblings: 1` in Pagination.tsx) - `Default` (page 1) only ever shows the
 * right dot. See docs/Testing/search-test-inventory.md §11, case 11.6.
 */
export const MiddlePage = {
	parameters: {
		nextjs: {
			router: {
				query: { page: '4' },
			},
		},
	},
}
