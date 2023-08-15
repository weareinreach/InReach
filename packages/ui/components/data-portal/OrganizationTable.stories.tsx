import { type Meta, type StoryObj } from '@storybook/react'

import { OrganizationTable } from './OrganizationTable'

export default {
	title: 'Data Portal/Tables/Organizations',
	component: OrganizationTable,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
	},
} satisfies Meta<typeof OrganizationTable>

type StoryDef = StoryObj<typeof OrganizationTable>

export const Default = {} satisfies StoryDef
