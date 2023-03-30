import { Meta, StoryObj } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { geoAutocompleteCityState, geoByPlaceIdCityState } from '~ui/mockData/geo'
import { suggestionOptions } from '~ui/mockData/suggestOrg'

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
				response: geoAutocompleteCityState,
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				response: geoByPlaceIdCityState,
			}),
			getTRPCMock({
				path: ['organization', 'suggestionOptions'],
				response: suggestionOptions,
			}),
		],
	},
} satisfies Meta<typeof SuggestOrg>

type StoryDef = StoryObj<typeof SuggestOrg>

export const Desktop = {} satisfies StoryDef
