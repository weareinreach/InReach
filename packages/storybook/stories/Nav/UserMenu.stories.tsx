import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { UserMenu } from '@weareinreach/ui/components/layout/Nav'

export default {
	title: 'App/Navigation/UserMenu',
	component: UserMenu,
	args: {},
} as ComponentMeta<typeof UserMenu>

const Template: ComponentStory<typeof UserMenu> = () => <UserMenu />

export const Story = Template.bind({})
Story.args = {}
