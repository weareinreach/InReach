import { Grid } from '@mantine/core'
import { Meta } from '@storybook/react'

import { StorybookGrid } from '~ui/components/layout/BodyGrid'
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
	decorators: [StorybookGrid],
	render: () => (
		<Grid.Col span={6} sm={6}>
			<ServiceFilter />
		</Grid.Col>
	),
} as Meta<typeof ServiceFilter>

export const ServiceFilterExample = {}
