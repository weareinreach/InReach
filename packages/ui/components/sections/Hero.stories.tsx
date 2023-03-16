import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts/BodyGrid'

import { Hero } from './Hero'

export default {
	title: 'Sections/Hero',
	component: Hero,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/9kGFZSfpdKIQydMrFKhlWi/Search-Landing-Page-Redesign?node-id=18%3A216&t=a1NHmzcT1shhofwn-4',
		},
		layout: 'fullscreen',
	},
	decorators: [StorybookGridDouble],
} satisfies Meta<typeof Hero>

type StoryDef = StoryObj<typeof Hero>

export const Default = {} satisfies StoryDef
