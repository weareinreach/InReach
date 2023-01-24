import { Button, Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { Icon } from '../../icon'

export default {
	title: 'Design System/Button',
	component: Button,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=196%3A5045&t=0SZ0JVMYe5r7bNkb-4',
		},
	},
} as ComponentMeta<typeof Button>

const ButtonVariant: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const SmallPrimary = ButtonVariant.bind({})
export const SmallSecondary = ButtonVariant.bind({})
export const SmallAccent = ButtonVariant.bind({})
export const LargePrimary = ButtonVariant.bind({})
export const LargeSecondary = ButtonVariant.bind({})
export const LargeAccent = ButtonVariant.bind({})

SmallPrimary.args = {
	variant: 'sm-primary',
	children: 'Download the app',
}
SmallSecondary.args = {
	variant: 'sm-secondary',
	children: 'InReach.org',
}
SmallAccent.args = {
	variant: 'sm-accent',
	children: 'Safety exit',
}
LargePrimary.args = {
	variant: 'lg-primary',
	children: 'More sorting options',
	leftIcon: <Icon icon='carbon:settings-adjust' rotate={3} />,
}
LargeSecondary.args = {
	variant: 'lg-secondary',
	children: 'Save',
	leftIcon: <Icon icon='carbon:favorite' />,
}
LargeAccent.args = {
	variant: 'lg-accent',
	children: 'View map',
	leftIcon: <Icon icon='carbon:map' />,
}
