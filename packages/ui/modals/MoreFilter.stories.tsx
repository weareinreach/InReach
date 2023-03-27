import { action } from '@storybook/addon-actions'
import { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { moreFilterMock } from '~ui/mockData/moreFilter'

import { MoreFilter } from './MoreFilter'

export default {
	title: 'Modals/More Filter',
	component: MoreFilter,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['attribute', 'getFilterOptions'],
					type: 'query',
					response: moreFilterMock,
				}),
			],
		},
		layout: 'fullscreen',
	},
	decorators: [StorybookGridDouble],
	render: function Render(args) {
		const [filter, setFilter] = useState<string[]>([])
		useEffect(() => {
			action('Set service filter')(filter)
		}, [filter])
		return <MoreFilter {...args} stateHandler={setFilter} />
	},
} as Meta<typeof MoreFilter>

export const MoreFilterExample = {}
