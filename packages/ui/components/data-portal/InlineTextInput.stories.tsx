import { Box } from '@mantine/core'
import { type Meta } from '@storybook/react'

import { InlineTextarea, InlineTextInput } from './InlineTextInput'

export default {
	title: 'Data Portal/Fields/Inline Text Field',
	component: InlineTextInput,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	argTypes: {
		fontSize: {
			options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'utility1', 'utility2', 'utility3', 'utility4'],
			control: { type: 'select' },
		},
		'data-isDirty': { control: { type: 'boolean' } },
	},
	args: {
		value: 'Test value',
	},
} satisfies Meta<typeof InlineTextInput>

export const TextInput = {
	args: {
		fontSize: 'h1',
	},
	render: (args) => (
		<Box w={'50%'}>
			<InlineTextInput {...args} />
		</Box>
	),
} satisfies Meta<typeof InlineTextInput>

export const Textarea = {
	args: {
		fontSize: 'utility1',
	},
	render: (args) => (
		<Box w={'50%'}>
			<InlineTextarea {...args} />
		</Box>
	),
} satisfies Meta<typeof InlineTextarea>
