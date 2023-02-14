import { Meta } from '@storybook/react'

import { ServiceFilter } from './ServiceFilter'

export default {
	title: 'Design System/Service Filter',
	component: ServiceFilter,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=OR50OY3K2rzSJbrl-0',
		},
	},
	argTypes: { onClick: { actions: 'clicked' } },
} as Meta<typeof ServiceFilter>

export const ServiceFilterExample = {
	args: {
		iconKey: 'save',
	},
}
