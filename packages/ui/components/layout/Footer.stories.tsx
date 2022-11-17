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
			iconCode: 'fa6-brands:facebook-f',
			key: 'facebook',
			href: '#',
		},
		{
			iconCode: 'fa6-brands:twitter',
			key: 'twitter',
			href: '#',
		},
		{
			iconCode: 'fa6-brands:linkedin-in',
			key: 'linkedin',
			href: '#',
		},
		{
			iconCode: 'fa6-regular:envelope',
			key: 'email',
			href: '#',
		},

		{
			iconCode: 'fa6-brands:instagram',
			key: 'instagram',
			href: '#',
		},
		{
			iconCode: 'fa6-brands:youtube',
			key: 'youtube',
			href: '#',
		},
	],
}
