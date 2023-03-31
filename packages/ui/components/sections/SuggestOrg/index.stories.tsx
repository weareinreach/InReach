import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { geoAutocompleteFullAddress, geocodeFullAddress } from '~ui/mockData/geo'
import { suggestionOptions, existingOrg } from '~ui/mockData/suggestOrg'

import { SuggestOrg } from '.'

export default {
	title: 'Sections/Suggest an Organization',
	component: SuggestOrg,
	parameters: {
		layout: 'fullscreen',
		layoutWrapper: 'gridDouble',
		msw: [
			getTRPCMock({
				path: ['geo', 'autocomplete'],
				type: 'query',
				response: geoAutocompleteFullAddress,
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				response: geocodeFullAddress,
			}),
			getTRPCMock({
				path: ['organization', 'suggestionOptions'],
				response: suggestionOptions,
			}),
			getTRPCMock({
				path: ['organization', 'checkForExisting'],
				response: (input) => existingOrg(input),
			}),
		],
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef
