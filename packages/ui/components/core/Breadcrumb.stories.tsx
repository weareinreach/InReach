import { Center } from '@mantine/core'
import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { Breadcrumb as BreadcrumbCompnent } from './Breadcrumb'

export default {
	title: 'Design System/Breadcrumb',
	component: BreadcrumbCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=297%3A6037&t=sleVeGl2lJv7Df18-4',
		},
	},
	argTypes: {
		icon: {
			options: ['back', 'close'],
		},
	},
} as Meta<typeof BreadcrumbCompnent>

export const BackToSearch = {
	args: {
		href: '#',
		option: 'back',
	} as const,
}
export const Close = {
	args: {
		href: '#',
		option: 'close',
	} as const,
}
