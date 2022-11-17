import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { FooterSection } from './Footer'

export default {
	title: 'App/Layout/PageFooter',
	component: FooterSection,
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
} as ComponentMeta<typeof FooterSection>

export const PageFooter: ComponentStory<typeof FooterSection> = (args) => <FooterSection {...args} />

// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
PageFooter.args = {
	links: [
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
