import { Meta } from '@storybook/react'
import React from 'react'

import { LeaderBadgeGroup } from './LeaderBadgeGroup'

const Story: Meta<typeof LeaderBadgeGroup> = {
	title: 'Design System/Tags and Badges/Leader Badge Group',
	component: LeaderBadgeGroup,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=234%3A8361&t=eVmG29UspAU8Pejs-0',
		},
	},
	argTypes: {
		badges: {
			type: {
				name: 'other',
				value: 'array',
				required: true,
			},
		},
	},
}
export default Story

export const Primary = {
	args: {
		badges: [
			{
				color: '#79ADD7',
				emoji: '️‍️‍🌎',
				key_value: 'immigrant-led',
				minify: false,
			},
			{
				color: '#c77e54',
				emoji: '️‍️‍✊🏿',
				key_value: 'black-led',
				minify: false,
			},
		],
	},
}

export const Minified = {
	args: {
		badges: [
			{
				color: '#79ADD7',
				emoji: '️‍️‍🌎',
				key_value: 'immigrant-led',
				minify: true,
				hideBg: true,
			},
			{
				color: '#c77e54',
				emoji: '️‍️‍✊🏿',
				key_value: 'black-led',
				minify: true,
				hideBg: true,
			},
		],
	},
}
