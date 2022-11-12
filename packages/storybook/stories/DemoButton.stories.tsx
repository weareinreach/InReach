import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Demobutton } from '@weareinreach/ui/components/Demobutton'

export default {
	title: 'Web/Call to Action button',
	component: Demobutton,
	// argTypes: {
	// 	value: {
	// 		name: 'Value from Sanity.io',

	// 	}
	// }
} as ComponentMeta<typeof Demobutton>

const Template: ComponentStory<typeof Demobutton> = () => <Demobutton />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
	value: { href: '/', title: 'Button Text' },
	target: '_blank',
}
