import { Meta, StoryFn } from '@storybook/react'
import React from 'react'

import { LeaderBadgeGroup } from './LeaderBadgeGroup'

export default {
	title: 'Design System/Tags and Badges/Leader Badge Group',
	component: LeaderBadgeGroup,

	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=eVmG29UspAU8Pejs-0',
		},
	},
} as Meta<typeof LeaderBadgeGroup>

export const BadgeGroupMinified = {
	args: {
		badges: [
			{
				color: 'yellow',
				emoji: '️‍️‍✊🏿',
				key_value: 'black-led',
				minify: true,
			},
			{
				color: 'green',
				emoji: '️‍️‍🌎',
				key_value: 'immigrant-led',
				minify: true,
			},
		],
	},
}

export const BadgeGroupRegular = {
	args: {
		badges: [
			{
				color: 'blue',
				emoji: '️‍️‍✊🏿',
				key_value: 'black-led',
				minify: false,
			},
			{
				color: 'red',
				emoji: '️‍️‍🌎',
				key_value: 'immigrant-led',
				minify: false,
			},
		],
	},
}
