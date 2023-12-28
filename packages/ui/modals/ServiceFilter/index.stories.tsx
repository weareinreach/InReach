import { action } from '@storybook/addon-actions'
import { type Meta } from '@storybook/react'
import { useEffect, useState } from 'react'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { service } from '~ui/mockData/service'

import { ServiceFilter } from './index'

export default {
	title: 'Modals/Service Filter',
	component: ServiceFilter,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},
		msw: {
			handlers: [service.getFilterOptions],
		},
		layout: 'fullscreen',
	},
	args: {
		resultCount: 25,
	},
	decorators: [StorybookGridDouble],
	render: function Render(args) {
		const [filter, _setFilter] = useState<string[]>([])
		useEffect(() => {
			action('Set service filter')(filter)
		}, [filter])

		return <ServiceFilter {...args} />
	},
} satisfies Meta<typeof ServiceFilter>

export const ServiceFilterExample = {}
