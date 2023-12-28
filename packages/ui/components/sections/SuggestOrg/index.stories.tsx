import { type Meta, type StoryObj } from '@storybook/react'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

import { SuggestOrg } from '.'

export default {
	title: 'Sections/Suggest an Organization',
	component: SuggestOrg,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'gridDouble',
		msw: [
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			organization.suggestionOptions,
			organization.createNewSuggestion,
			organization.checkForExisting,
			organization.generateSlug,
		],
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef
