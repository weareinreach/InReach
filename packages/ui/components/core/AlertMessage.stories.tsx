import { Meta } from '@storybook/react'
import React from 'react'

import { AlertMessage as AlertMessageCompnent } from './AlertMessage'
import { StorybookGrid } from '../layout/BodyGrid'

const Story: Meta<typeof AlertMessageCompnent> = {
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
}
export default Story
export const Information = {
	args: {
		iconKey: 'information',
		textKey: 'alert-message-1',
	},
}

export const Warning = {
	args: {
		iconKey: 'warning',
		textKey: 'alert-message-1',
	},
}
