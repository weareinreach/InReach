import { Meta, StoryObj } from '@storybook/react'

import { LeaderBadgeGroup } from './LeaderBadgeGroup'

const Story = {
	title: 'Design System/Tags and Badges/Leader Badge Group',
	component: LeaderBadgeGroup,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=337%3A7074&t=sleVeGl2lJv7Df18-4',
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
} satisfies Meta<typeof LeaderBadgeGroup>
export default Story

type StoryDef = StoryObj<typeof LeaderBadgeGroup>

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
} satisfies StoryDef

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
} satisfies StoryDef
