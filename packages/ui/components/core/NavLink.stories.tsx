import { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { NavLinkItem as NavLinkComponent } from './NavLink'

export default {
	title: 'Design System/Nav Link',
	component: NavLinkComponent,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=68%3A389&t=6tj0T5JJT9cer7Q6-0',
		},
	},
	argTypes: {
		active: {
			control: 'boolean',
		},
	},
} as ComponentMeta<typeof NavLinkComponent>

const NavLinkVariant: ComponentStory<typeof NavLinkComponent> = (args) => <NavLinkComponent {...args} />

export const NavLink = NavLinkVariant.bind({})

NavLink.args = {
	active: true,
	navItem: 'search',
}
