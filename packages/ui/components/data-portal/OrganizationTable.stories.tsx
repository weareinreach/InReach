import { type Meta, type StoryObj } from '@storybook/react'

import { organization } from '~ui/mockData/organization'

import { OrganizationTable } from './OrganizationTable'

export default {
	title: 'Data Portal/Tables/Organizations',
	component: OrganizationTable,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
		msw: [organization.forOrganizationTable],
		rqDevtools: true,
	},
} satisfies Meta<typeof OrganizationTable>

type StoryDef = StoryObj<typeof OrganizationTable>

export const Default = {} satisfies StoryDef
