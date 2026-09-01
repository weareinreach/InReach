import { type Meta, type StoryObj } from '@storybook/nextjs'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

import { AddOrgModal } from './AddOrgModal'

const meta = {
	title: 'Data Portal/AddOrgModal',
	component: AddOrgModal,

	beforeEach({ msw }) {
		msw.use(
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createOrgFromDataPortal,
			organization.generateSlug,
			organization.getPotentialMatches,
			organization.forOrganizationTable
		)
	},

	parameters: {
		layout: 'fullscreen',

		nextjs: {
			router: {
				pathname: '/data-portal/organizations',
				asPath: '/data-portal/organizations',
			},
		},
	},

	args: {
		children: 'Add an organization',
	},
} satisfies Meta<typeof AddOrgModal>

export default meta

type Story = StoryObj<typeof meta>

// Click the trigger button to open the modal - same fields/validation/duplicate-check as the public
// Suggest-an-Org form, three save buttons instead of one submit button.
export const Default: Story = {}

// Same as Default, but the duplicate-check mock is pre-loaded to demo the "open in a new tab to edit
// instead" flow: type a website containing "example.org" (or the name "Existing Organization") after
// opening the modal.
export const WithDuplicateHandling: Story = {
	beforeEach({ msw }) {
		msw.use(
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createOrgFromDataPortalConflict,
			organization.generateSlug,
			organization.getPotentialMatches,
			organization.forOrganizationTable
		)
	},
}
