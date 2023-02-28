import { Meta, StoryObj } from '@storybook/react'

import { Link as LinkComponent } from './Link'

export default {
	title: 'Design System/Link',
	component: LinkComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=297%3A6035&t=sleVeGl2lJv7Df18-4',
		},
	},
} satisfies Meta<typeof LinkComponent>
type StoryDef = StoryObj<typeof LinkComponent>

export const Internal = {
	args: {
		href: '/',
		children: 'Home',
	},
} satisfies StoryDef

export const External = {
	args: {
		children: 'Google',
		href: 'https://google.com',
		target: '_blank',
	},
} satisfies StoryDef
