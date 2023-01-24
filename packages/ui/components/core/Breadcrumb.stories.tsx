import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { Breadcrumb as BreadcrumbCompnent } from './Breadcrumb'

export default {
	title: 'Design System/Breadcrumb',
	component: BreadcrumbCompnent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=196%3A5045&t=0SZ0JVMYe5r7bNkb-4',
		},
	},
	argTypes: {
		icon: {
			options: ['back', 'close'],
		},
	},
} as ComponentMeta<typeof BreadcrumbCompnent>

const BreadcrumbStory: ComponentStory<typeof BreadcrumbCompnent> = (args) => <BreadcrumbCompnent {...args} />

export const Breadcrumb = BreadcrumbStory.bind({})

Breadcrumb.args = {
	href: '#',
	option: 'back',
} as const
