import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts/BodyGrid'

import { AlertMessage as AlertMessageCompnent } from './AlertMessage'

const Story = {
	title: 'Design System/Alert Message',
	component: AlertMessageCompnent,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=212%3A8848&t=sleVeGl2lJv7Df18-4',
		},
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof AlertMessageCompnent>
export default Story

type StoryDef = StoryObj<typeof AlertMessageCompnent>

export const Information = {
	args: {
		iconKey: 'information',
		textKey: 'alert-message-1',
	},
} satisfies StoryDef

export const Warning = {
	args: {
		iconKey: 'warning',
		textKey: 'alert-message-1',
	},
} satisfies StoryDef
