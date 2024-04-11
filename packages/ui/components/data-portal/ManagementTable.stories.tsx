import { type Meta, type StoryObj } from '@storybook/react'

import { user } from '~ui/mockData/user'

import { ManagementTable } from './ManagementTable'

export default {
	title: 'Data Portal/Tables/User Management',
	component: ManagementTable,
	parameters: {
		msw: [user.forUserTable],
		rqDevtools: true,
	},
} satisfies Meta<typeof ManagementTable>

type StoryDef = StoryObj<typeof ManagementTable>

export const Default = {} satisfies StoryDef
