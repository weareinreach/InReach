import { Meta } from '@storybook/react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { mockAutocomplete, mockGeocode } from '~ui/mockData/locationSearch'
import { mockOrgNameSearch } from '~ui/mockData/orgSearch'

import { SearchBox as SearchBoxComp } from './SearchBox'

export default {
	title: 'Design System/Search Box',
	component: SearchBoxComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=AVaWASBVFglQPwtW-0',
		},
		msw: [
			getTRPCMock({
				path: ['organization', 'searchName'],
				type: 'query',
				response: (input) => mockOrgNameSearch(input),
			}),
			getTRPCMock({
				path: ['geo', 'autocomplete'],
				type: 'query',
				response: (input) => mockAutocomplete(input),
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				type: 'query',
				response: (input) => mockGeocode(input),
			}),
		],
	},
	render: (args) => (
		<div style={{ minWidth: '600px' }}>
			<SearchBoxComp {...args} />
		</div>
	),
} as Meta<typeof SearchBoxComp>

export const ByLocation = {
	args: {
		type: 'location',
	},
}

export const ByOrganization = {
	args: {
		type: 'organization',
	},
}
