import { Meta, StoryObj } from '@storybook/react'

import { ActionButtons as ActionButtonsComponent } from './ActionButtons'

export default {
	title: 'Design System/Action Buttons',
	component: ActionButtonsComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=52%3A1420&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies Meta<typeof ActionButtonsComponent>

type StoryDef = StoryObj<typeof ActionButtonsComponent>

export const Save = {
	args: {
		iconKey: 'save',
	},
} satisfies StoryDef
export const Saved = {
	args: {
		iconKey: 'saved',
	},
} satisfies StoryDef
export const Share = {
	args: {
		iconKey: 'share',
	},
} satisfies StoryDef
export const Print = {
	args: {
		iconKey: 'print',
	},
} satisfies StoryDef
export const Delete = {
	args: {
		iconKey: 'delete',
	},
} satisfies StoryDef
export const Review = {
	args: {
		iconKey: 'review',
	},
} satisfies StoryDef
export const More = {
	args: {
		iconKey: 'more',
	},
} satisfies StoryDef
