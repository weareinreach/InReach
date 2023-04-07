import { Meta, StoryObj } from '@storybook/react'

import { Hours } from './Hours'

export default {
	title: 'Data Display/Hours',
	component: Hours,
	args: {
		data: [
			{
				dayIndex: 1,
				start: new Date('1970-01-01T12:30:00.000Z'),
				end: new Date('1970-01-01T21:30:00.000Z'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				dayIndex: 2,
				start: new Date('1970-01-01T12:30:00.000Z'),
				end: new Date('1970-01-01T21:30:00.000Z'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				dayIndex: 3,
				start: new Date('1970-01-01T12:30:00.000Z'),
				end: new Date('1970-01-01T21:30:00.000Z'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				dayIndex: 4,
				start: new Date('1970-01-01T12:30:00.000Z'),
				end: new Date('1970-01-01T21:30:00.000Z'),
				closed: false,
				tz: 'America/New_York',
			},
			{
				dayIndex: 5,
				start: new Date('1970-01-01T12:30:00.000Z'),
				end: new Date('1970-01-01T21:00:00.000Z'),
				closed: false,
				tz: 'America/New_York',
			},
		],
	},
} satisfies Meta<typeof Hours>

type StoryDef = StoryObj<typeof Hours>

export const Default = {} satisfies StoryDef
