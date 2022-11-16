import { BADGE } from '@geometricpanda/storybook-addon-badges'
import { ComponentMeta, ComponentStory } from '@storybook/react'

import React from 'react'

import { UserMenu as UserMenuComponent } from './'

export default {
	title: 'App/Navigation/UserMenu',
	component: UserMenuComponent,
	parameters: {
		badges: [BADGE.BETA],
	},
} as ComponentMeta<typeof UserMenuComponent>

const Template: ComponentStory<typeof UserMenuComponent> = () => <UserMenuComponent />

export const UserMenu = Template.bind({})
UserMenu.args = {}
