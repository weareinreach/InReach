import { Icon } from '@iconify/react'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { Button, Center, Menu } from '@mantine/core'

export default {
	title: 'Core/Menu',
	component: Menu,
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
} as ComponentMeta<typeof Menu>

// const Large: ComponentStory<typeof Button> = (args) => (
// 	<Button leftIcon={<Icon icon={args.icon} />} {...args} />
// )
// const Small: ComponentStory<typeof Button> = (args) => <Button {...args} />

const MenuVariant: ComponentStory<typeof Menu> = (args) => (
	<Menu shadow='md' width={200}>
		<Menu.Target>
			<Button>Toggle menu</Button>
		</Menu.Target>

		<Menu.Dropdown>
			<Menu.Label>Application</Menu.Label>
			<Menu.Item>Settings</Menu.Item>

			<Menu.Divider />
		</Menu.Dropdown>
	</Menu>
)
export const Hello = MenuVariant.bind({})

Hello.args = {
	children: 'Download the app',
}
// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
