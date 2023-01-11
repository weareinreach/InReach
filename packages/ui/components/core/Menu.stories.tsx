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

const MenuVariant: ComponentStory<typeof Menu> = () => (
	<Menu>
		<Menu.Target>
			<Button>Save</Button>
		</Menu.Target>

		<Menu.Dropdown>
			<Menu.Item>Create New List</Menu.Item>
			<Menu.Item>List1</Menu.Item>
			<Menu.Item>List2</Menu.Item>
		</Menu.Dropdown>
	</Menu>
)
export const Save = MenuVariant.bind({})

Save.args = {
	children: 'Download the app',
}
// export const SafetyExitButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
