import { Icon } from '@iconify/react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Button, Center } from '@mantine/core'

export default {
	title: 'App/Layout/eButton',
	component: Button,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
} as ComponentMeta<typeof Button>

const Large: ComponentStory<typeof Button> = (args) => (
	<Button leftIcon={<Icon icon={args.icon} />} {...args} />
)
const Small: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const SmallPrimary = Small.bind({})
export const SmallSecondary = Small.bind({})
export const SmallAccent = Small.bind({})
export const LargePrimary = Large.bind({})
export const LargeSecondary = Large.bind({})
export const LargeAccent = Large.bind({})

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
	icon: 'lucide:sliders',
}
LargeSecondary.args = {
	variant: 'lg-secondary',
	children: 'Save',
	icon: 'fe:heart-o',
}
LargeAccent.args = {
	variant: 'lg-accent',
	children: 'View map',
	icon: 'fe:map',
}
// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
