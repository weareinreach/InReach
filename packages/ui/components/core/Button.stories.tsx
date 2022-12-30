import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Heart, Map, Sliders } from 'react-feather'

import React from 'react'

import { Button, Center } from '@mantine/core'

export default {
	title: 'Core/Button',
	component: Button,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=196%3A5045&t=0SZ0JVMYe5r7bNkb-4',
		},
	},
} as ComponentMeta<typeof Button>

// const Large: ComponentStory<typeof Button> = (args) => (
// 	<Button leftIcon={<Icon icon={args.icon} />} {...args} />
// )
// const Small: ComponentStory<typeof Button> = (args) => <Button {...args} />

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
	// icon: 'lucide:sliders',
	leftIcon: <Sliders />,
}
LargeSecondary.args = {
	variant: 'lg-secondary',
	children: 'Save',
	// icon: 'fe:heart-o',
	leftIcon: <Heart />,
}
LargeAccent.args = {
	variant: 'lg-accent',
	children: 'View map',
	// icon: 'fe:map',
	leftIcon: <Map />,
}
// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
