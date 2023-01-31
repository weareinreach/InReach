import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { StoryObj, Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { UserMenu } from './'
import { Nav } from './Nav'

export default {
	title: 'App/Layout/NavigationHeaderBar',
	component: Nav,
	subcomponents: { UserMenu },
	decorators: [
		(Story) => (
			<div style={{ width: '100vw' }}>
				<Story />
			</div>
		),
	],
	parameters: {
		badges: [BADGE.BETA],
		layout: 'fullscreen',
	},
} as Meta<typeof Nav>

export const NavigationHeaderBar: StoryObj<typeof Nav> = {
	args: {
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
	},
}
