import { type Meta, type StoryObj } from '@storybook/react'

import { MultiSelectPopover } from './MultiSelectPopover'

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
		label: 'Dropdown target text',
	},
	argTypes: {
		onChange: { action: 'Updated Values' },
	},
	// render: ComponentWithState,
} satisfies Meta<typeof MultiSelectPopover>

type StoryDef = StoryObj<typeof MultiSelectPopover>

export const Default = {} satisfies StoryDef
