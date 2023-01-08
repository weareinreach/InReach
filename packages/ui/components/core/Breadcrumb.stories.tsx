import { Icon } from '@iconify/react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Center } from '@mantine/core'

import { Breadcrumb } from './Breadcrumb'

export default {
	title: 'Core/Breadcrumb',
	component: Breadcrumb,
	decorators: [
		(Story) => (
			<Center style={{ width: '100vw' }}>
				<Story />
			</Center>
		),
	],
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
} as ComponentMeta<typeof Breadcrumb>

const BreadcrumbVariant: ComponentStory<typeof Breadcrumb> = (args) => <Breadcrumb {...args} />

export const BreadCrumbVariant = BreadcrumbVariant.bind({})

BreadCrumbVariant.args = {
	href: '#',
	option: 'back',
}
