import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { LeaderBadge } from './LeaderBadge'
import { LeaderBadgeGroup } from './LeaderBadgeGroup'

export default {
	title: 'Design System/Tags and Badges/Leader Badge',
	component: LeaderBadge,
	subcomponents: { LeaderBadgeGroup },
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=eVmG29UspAU8Pejs-0',
		},
	},
} as Meta<typeof LeaderBadge>

export const BadgeMinified = {
	args: {
		color: 'red',
		emoji: '️‍️‍✊🏿',
		key_value: 'black-led',
		minify: true,
	} as const,
}

export const BadgeRegular = {
	args: {
		color: 'blue',
		emoji: '️‍️‍🌎',
		key_value: 'immigrant-led',
		minify: false,
	} as const,
}
