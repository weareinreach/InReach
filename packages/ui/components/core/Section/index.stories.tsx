import { type Meta, type StoryObj } from '@storybook/react'

import { Section } from './index'

export default {
	title: 'Design System/Section',
	component: Section,
} satisfies Meta<typeof Section>

export const Divider = {
	args: {
		title: 'Section Name',
		children: 'Section Content',
		w: 500,
	},
	render: (args) => <Section.Divider {...args} />,
} satisfies StoryObj<typeof Section.Divider>

export const Subsection = {
	args: {
		title: 'Section Name',
		children: 'Section Content',
	},
	render: (args) => <Section.Sub {...args} />,
} satisfies StoryObj<typeof Section.Sub>
