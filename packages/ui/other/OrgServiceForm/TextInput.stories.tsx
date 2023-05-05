import { Box } from '@mantine/core'
import { type Meta } from '@storybook/react'

import { MultiLineTextField, SingleLineTextField } from './TextInput'

export default {
	title: 'Forms/VariantTextField',
	component: SingleLineTextField,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
} satisfies Meta<typeof SingleLineTextField>

export const SingleLine = {
	args: {
		fontSize: 'h1',
	},
	render: (args) => (
		<Box w={'50%'}>
			<SingleLineTextField {...args} />
		</Box>
	),
} satisfies Meta<typeof SingleLineTextField>

export const MultiLine = {
	args: {
		fontSize: 'utility1',
	},
	render: (args) => (
		<Box w={'50%'}>
			<MultiLineTextField {...args} />
		</Box>
	),
} satisfies Meta<typeof MultiLineTextField>
