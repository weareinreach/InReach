import { type Meta, type StoryObj } from '@storybook/nextjs'

import { orgHours } from '~ui/mockData/orgHours'

import { Hours } from './Hours'

export default {
	title: 'Data Display/Hours',
	component: Hours,

	args: {
		parentId: 'parentId',
	},

	beforeEach({ msw }) {
		msw.use(orgHours.forHoursDisplay)
	},
} satisfies Meta<typeof Hours>

type StoryDef = StoryObj<typeof Hours>

export const Default = {} satisfies StoryDef
