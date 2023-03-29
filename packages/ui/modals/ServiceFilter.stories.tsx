import { action } from '@storybook/addon-actions'
import { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { serviceFilterMock } from '~ui/mockData/serviceFilter'

import { ServiceFilter } from './ServiceFilter'

export default {
	title: 'Modals/Service Filter',
	component: ServiceFilter,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},
		msw: {
			handlers: [
				getTRPCMock({
					path: ['service', 'getFilterOptions'],
					type: 'query',
					response: [...serviceFilterMock],
				}),
			],
		},
		layout: 'fullscreen',
	},
	args: {
		resultCount: 25,
	},
	decorators: [StorybookGridDouble],
	render: function Render(args) {
		const [filter, setFilter] = useState<string[]>([])
		useEffect(() => {
			action('Set service filter')(filter)
		}, [filter])

		return <ServiceFilter {...args} stateHandler={setFilter} />
	},
} as Meta<typeof ServiceFilter>

export const ServiceFilterExample = {}
