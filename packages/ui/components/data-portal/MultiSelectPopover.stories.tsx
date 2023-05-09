import { action } from '@storybook/addon-actions'
import { type Meta, type StoryObj } from '@storybook/react'

import { MultiSelectPopover } from './MultiSelectPopover'

const checkboxChanged = action('values')

export default {
	title: 'Data Portal/Multi Select Popover',
	component: MultiSelectPopover,
	args: {
		data: [
			{ value: '1', label: 'one one one one one one one one one one' },
			{ value: '2', label: 'two two two two two two two' },
			{ value: '3', label: 'three three three three three three three' },
			{ value: '4', label: 'four four four four four' },
		],
		checkboxGroupProps: {
			onChange: (val) => checkboxChanged(val),
			defaultValue: ['2'],
		},
		label: 'Dropdown target text',
	},
} satisfies Meta<typeof MultiSelectPopover>

type StoryDef = StoryObj<typeof MultiSelectPopover>

export const Default = {} satisfies StoryDef
