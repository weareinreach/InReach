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

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const LargePrimary = Template.bind({})
export const LargeSecondary = Template.bind({})
export const LargeAccent = Template.bind({})

LargePrimary.args = {
	variant: 'lg-primary',
	children: 'More sorting options',
}
LargeSecondary.args = {
	variant: 'lg-secondary',
	children: 'Save',
}
LargeAccent.args = {
	variant: 'lg-accent',
	children: 'View map',
}

// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
