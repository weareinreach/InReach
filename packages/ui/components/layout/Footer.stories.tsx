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
			key: 'suggest-a-resource',
			href: '#suggest',
		},
		{
			key: 'subscribe-to-newsletter',
			href: '#subscribe',
		},
		{
			key: 'share-feedback',
			href: '#feedback',
		},
		{
			key: 'disclaimer',
			href: '#disclaimer',
		},
		{
			key: 'privacy-statement',
			href: '#privacy',
		},
	],
	socialMedia: [
		{
			icon: 'facebook',
			key: 'facebook',
			href: '#',
		},
		{
			icon: 'twitter',
			key: 'twitter',
			href: '#',
		},
		{
			icon: 'linkedin',
			key: 'linkedin',
			href: '#',
		},
		{
			icon: 'email',
			key: 'email',
			href: '#',
		},

		{
			icon: 'instagram',
			key: 'instagram',
			href: '#',
		},
		{
			icon: 'youtube',
			key: 'youtube',
			href: '#',
		},
	],
}
