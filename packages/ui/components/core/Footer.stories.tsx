import { Meta, StoryObj } from '@storybook/react'

import { Footer } from './Footer'

export default {
	title: 'Design System/Footer',
	component: Footer,
	parameters: {
		layout: 'fullscreen',
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=244%3A4610&t=WqaFVxYHcCYzyF2K-4',
		},
	},
} satisfies Meta<typeof Footer>

type StoryDef = StoryObj<typeof Footer>

export const Default = {} satisfies StoryDef
