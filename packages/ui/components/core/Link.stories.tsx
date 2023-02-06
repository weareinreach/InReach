import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

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
} as Meta<typeof LinkComponent>

export const Link = {
	args: {
		children: 'safehorizon.com',
		href: 'google.com',
	},
}
