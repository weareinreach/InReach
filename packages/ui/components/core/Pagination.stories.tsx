import { action } from '@storybook/addon-actions'
import { addArgs } from '@storybook/preview-api'
import { Meta } from '@storybook/react'

import { Pagination } from './Pagination'

let currPage = 1

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
