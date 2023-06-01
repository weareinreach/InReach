import { type Meta, type StoryObj } from '@storybook/react'

import { SearchDistance } from './SearchDistance'

export default {
	title: 'Design System/Search Distance Slider',
	component: SearchDistance,
	parameters: {
		searchContext: {
			searchState: {
				params: ['dist', '-77.0368707', '38.9071923', '50', 'mi'],
				a: [],
				page: '1',
				s: [],
			},
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
	},
	render: () => (
		<div style={{ width: '300px' }}>
			<SearchDistance />
		</div>
	),
} satisfies Meta<typeof SearchDistance>

type StoryDef = StoryObj<typeof SearchDistance>

export const Default = {} satisfies StoryDef
