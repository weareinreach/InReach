import { Textarea } from '@mantine/core'
import { type Meta, type StoryObj } from '@storybook/react'

import { InlineTextInput } from './InlineTextInput'

export default {
	title: 'Data Portal/Fields/Inline Text Field',
	component: InlineTextInput,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'gridDouble',
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
type StoryDef = StoryObj<typeof InlineTextInput>
export const SingleLine = {
	args: {
		fontSize: 'h1',
	},
} satisfies StoryDef

export const MultiLine = {
	args: {
		fontSize: 'utility1',
		component: Textarea,
	},
} satisfies StoryDef
