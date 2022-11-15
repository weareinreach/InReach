import { BADGE } from '@geometricpanda/storybook-addon-badges'
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
	parameters: {
		badges: [BADGE.BETA],
		layout: 'padded',
	},
} as ComponentMeta<typeof Nav>

export const NavigationBar: ComponentStory<typeof Nav> = (args) => <Nav {...args} />

// export const NavigationBar = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
NavigationBar.args = {
	navItems: [
		{
			key: 'nav-about-us',
			href: '#aboutus',
		},
		{
			key: 'nav-take-action',
			href: '#takeaction',
		},
		{
			key: 'nav-questions',
			href: '#questions',
		},
		{
			key: 'nav-contact-us',
			href: '#contactus',
		},
	],
}
