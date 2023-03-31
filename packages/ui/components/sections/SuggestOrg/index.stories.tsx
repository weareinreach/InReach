import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { geoAutocompleteFullAddress, getFullAddress } from '~ui/mockData/geo'
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
				response: (input) => getFullAddress(input),
			}),
			getTRPCMock({
				path: ['organization', 'suggestionOptions'],
				response: suggestionOptions,
			}),
			getTRPCMock({
				path: ['organization', 'checkForExisting'],
				response: (input) => existingOrg(input),
			}),
			getTRPCMock({
				path: ['organization', 'createNewSuggestion'],
				type: 'mutation',
				response: { id: 'sugg_LKSDJFIOW156AWER15' },
			}),
			getTRPCMock({
				path: ['organization', 'generateSlug'],
				response: 'this-is-a-generated-slug',
			}),
		],
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef
