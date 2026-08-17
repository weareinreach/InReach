import { type Meta, type StoryObj } from '@storybook/nextjs'

import { organization } from '~ui/mockData/organization'

import { OrganizationTable } from './OrganizationTable'

export default {
	title: 'Data Portal/Tables/Organizations',
	component: OrganizationTable,

	beforeEach({ msw }) {
		msw.use(organization.forOrganizationTable)
	},

	parameters: {
		layoutWrapper: 'centeredFullscreen',
		rqDevtools: true,
	},
} satisfies Meta<typeof OrganizationTable>

type StoryDef = StoryObj<typeof OrganizationTable>

export const Default = {} satisfies StoryDef
