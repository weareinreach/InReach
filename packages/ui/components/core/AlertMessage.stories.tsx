import { Meta } from '@storybook/react'
import React from 'react'

import { AlertMessage as AlertMessageCompnent } from './AlertMessage'

export default {
	title: 'Design System/Alert Message',
	component: AlertMessageCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=70%3A2310&t=v8Asw8U9mWb2EIZk-0',
		},
	},
} as Meta<typeof AlertMessageCompnent>

export const LargeInformation = {
	args: {
		iconKey: 'information',
		textKey: 'alert-message-1',
		size: 'lg',
	},
}

export const LargeWarning = {
	args: {
		iconKey: 'warning',
		textKey: 'alert-message-1',
		size: 'lg',
	},
}

export const SmallInformation = {
	args: {
		iconKey: 'information',
		textKey: 'alert-message-1',
		size: 'sm',
	},
}

export const SmallWarning = {
	args: {
		iconKey: 'warning',
		textKey: 'alert-message-1',
		size: 'sm',
	},
}
