import { Meta, StoryObj } from '@storybook/react'

import { Badge } from './Badge'

export default {
	title: 'Design System/Tags and Badges',
	component: Badge,
	parameters: {
		controls: {
			include: ['variant', 'children', 'leftSection'],
		},
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8505&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: {
		leftSection: {
			control: 'text',
		},
	},
} satisfies Meta<typeof Badge>
type StoryDef = StoryObj<typeof Badge>

export const CommunityTag = {
	args: {
		leftSection: '✊🏿',
		children: 'BIPOC community',
		variant: 'commmunityTag',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8506&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies StoryDef

export const ServiceTag = {
	args: {
		children: 'Abortion Care',
		variant: 'serviceTag',
	},
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8508&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies StoryDef
