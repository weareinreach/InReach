import { Meta } from '@storybook/react'
import React from 'react'

import { LeaderBadge as LeaderBadgeComp } from './LeaderBadge'
import { commonTheme as theme } from '../../theme/common'

const Story: Meta<typeof LeaderBadgeComp> = {
	title: 'Design System/Tags and Badges/Leader Badge',
	component: LeaderBadgeComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=337%3A7072&t=sleVeGl2lJv7Df18-4',
		},
	},
}
export default Story

// eslint-disable-next-line react-hooks/rules-of-hooks

export const Primary = {
	args: {
		color: theme.other!.colors.tertiary.lightBlue,
		emoji: '️‍️‍🌎',
		key_value: 'immigrant-led',
		minify: false,
	},
}

export const Minified = {
	args: {
		color: theme.other!.colors.tertiary.orange,
		emoji: '️‍️‍✊🏿',
		key_value: 'black-led',
		minify: true,
	},
}
