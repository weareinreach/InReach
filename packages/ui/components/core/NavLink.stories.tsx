import { Center } from '@mantine/core'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { NavLinkItem as NavLinkComponent, navIcons } from './NavLink'

export default {
	title: 'Design System/Nav Link',
	component: NavLinkComponent,
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
			url:'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=68%3A389&t=6tj0T5JJT9cer7Q6-0',
		},
	},
	argTypes: {
		icon: {
			options: Object.keys(navIcons),
		},
	},
} as ComponentMeta<typeof NavLinkComponent>

const NavLinkVariant: ComponentStory<typeof NavLinkComponent> = (args) => <NavLinkComponent {...args} />

export const NavLink = NavLinkVariant.bind({})

NavLink.args = {
	children: 'Search',
	icon: 'search'
}
