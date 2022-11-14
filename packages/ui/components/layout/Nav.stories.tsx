import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Nav } from './Nav'

export default {
	title: 'App/Navigation/Navigation Bar',
	component: Nav,
} as ComponentMeta<typeof Nav>

const Template: ComponentStory<typeof Nav> = (args) => <Nav {...args} />

export const Primary = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
	navItems: [
		{
			key: 'About Us',
			href: '#aboutus',
		},
		{
			key: 'Take Action',
			href: '#takeaction',
		},
		{
			key: 'Questions?',
			href: '#questions',
		},
		{
			key: 'Contact Us',
			href: '#contactus',
		},
	],
}
