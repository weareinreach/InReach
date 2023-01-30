import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { AlertMessage as AlertMessageCompnent } from './AlertMessage'

export default {
	title: 'Design System/Alert Message',
	component: AlertMessageCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=368%3A6934&t=OPIs2wdc5n2td3Nf-4',
		},
	},
} as ComponentMeta<typeof AlertMessageCompnent>

const AlertMessage: ComponentStory<typeof AlertMessageCompnent> = (args) => <AlertMessageCompnent {...args} />

export const AlertMessageCardSmall = AlertMessage.bind({})
export const AlertMessageCardLarge = AlertMessage.bind({})

AlertMessageCardSmall.args = {
	iconKey: 'information',
	textKey: 'alert-message-1',
	size: 'small',
}

AlertMessageCardLarge.args = {
	iconKey: 'warning',
	textKey: 'alert-message-1',
	size: 'large',
}
