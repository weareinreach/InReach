import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { AppLayout } from './AppLayout'

const mockNav = [
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
]

export default {
	title: 'App/Layout/MainAppLayout',
	component: AppLayout,
	args: {
		navItems: mockNav,
	},
	parameters: {
		layout: 'fullscreen',
	},
} as ComponentMeta<typeof AppLayout>

const Template: ComponentStory<typeof AppLayout> = (args) => <AppLayout {...args} />

export const MainAppLayout = Template.bind({})
MainAppLayout.args = {
	navItems: mockNav,
	footerLinks: mockNav,
}
MainAppLayout.parameters = {
	layout: 'fullscreen',
}
