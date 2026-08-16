import { type Meta, type StoryObj } from '@storybook/nextjs'

import { user } from '~ui/mockData/user'

import { UserTable } from './UserTable'

export default {
	title: 'Data Portal/Tables/User Management',
	component: UserTable,

	beforeEach({ msw }) {
		msw.use(user.forUserTable)
	},

	parameters: {
		rqDevtools: true,
	},
} satisfies Meta<typeof UserTable>

type StoryDef = StoryObj<typeof UserTable>

export const Default = {} satisfies StoryDef
