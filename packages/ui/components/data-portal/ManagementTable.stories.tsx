import { type Meta, type StoryObj } from '@storybook/react'

import { userManagement } from '~ui/mockData/userManagement'

import { ManagementTable } from './ManagementTable'

export default {
	title: 'Data Portal/Tables/User Management',
	component: ManagementTable,
	args: {
		data: userManagement.forUserManagementTable(),
		columns: userManagement.forUserManagementColumns(),
	},
} satisfies Meta<typeof ManagementTable>

type StoryDef = StoryObj<typeof ManagementTable>

export const Default = {} satisfies StoryDef
