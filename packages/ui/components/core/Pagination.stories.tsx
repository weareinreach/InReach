import { type Meta } from '@storybook/react'

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
