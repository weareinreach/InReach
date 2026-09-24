import { type Meta, type StoryObj } from '@storybook/nextjs'

import { organization } from '~ui/mockData/organization'
import { user } from '~ui/mockData/user'

import { OrganizationTable } from './OrganizationTable'

export default {
	title: 'Data Portal/Tables/Organizations',
	component: OrganizationTable,

	beforeEach({ msw }) {
		msw.use(organization.forOrganizationTable, user.searchTypeahead)
	},

	parameters: {
		layoutWrapper: 'centeredFullscreen',
		rqDevtools: true,
	},
} satisfies Meta<typeof OrganizationTable>

type StoryDef = StoryObj<typeof OrganizationTable>

export const Default = {} satisfies StoryDef

// Demos the table's error banner for a session without Data Portal access - `forOrganizationTable` is
// gated behind `viewAllOrganizations` (dataPortalBasic+) server-side, so a stale/expired/permission-less
// session sees this instead of table rows.
export const Unauthorized = {
	beforeEach({ msw }) {
		msw.use(organization.forOrganizationTableUnauthorized)
	},
} satisfies StoryDef
