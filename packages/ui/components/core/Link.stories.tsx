import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { Link as LinkComponent } from './Link'

export default {
	title: 'Design System/Link',
	component: LinkComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A472&t=B8mXSj3DhvoZv0ea-0',
		},
	},
} as ComponentMeta<typeof LinkComponent>

const LinkVariant: ComponentStory<typeof LinkComponent> = (args) => <LinkComponent {...args} />

export const Link = LinkVariant.bind({})

Link.args = {
	children: 'safehorizon.com',
	href: 'google.com',
}
