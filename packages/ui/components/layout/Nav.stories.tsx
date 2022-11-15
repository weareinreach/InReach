import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Nav } from './Nav'

export default {
	title: 'App/Navigation/NavigationBar',
	component: Nav,
	decorators: [
		(Story) => (
			<div style={{ width: '100vw' }}>
				<Story />
			</div>
		),
	],
} as ComponentMeta<typeof Nav>

export const NavigationBar: ComponentStory<typeof Nav> = (args) => <Nav {...args} />

// export const NavigationBar = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
NavigationBar.args = {
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
