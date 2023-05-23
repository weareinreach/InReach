import { type Meta, type StoryObj } from '@storybook/react'
import { type ComponentProps, useState } from 'react'
import { type SetOptional } from 'type-fest'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { mockAutocomplete, mockGeocode } from '~ui/mockData/locationSearch'
import { mockOrgNameSearch } from '~ui/mockData/orgSearch'

import { SearchBox as SearchBoxComp } from './SearchBox'

const StateWrapper = (args: SetOptional<ComponentProps<typeof SearchBoxComp>, 'loadingManager'>) => {
	const [isLoading, setLoading] = useState(false)
	const loadingManager = { isLoading, setLoading }
	return <SearchBoxComp loadingManager={loadingManager} {...args} />
}

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
				delay: 1500,
			}),
			getTRPCMock({
				path: ['geo', 'autocomplete'],
				type: 'query',
				response: (input) => mockAutocomplete(input),
				delay: 2000,
			}),
			getTRPCMock({
				path: ['geo', 'geoByPlaceId'],
				type: 'query',
				response: (input) => mockGeocode(input),
			}),
		],
		layoutWrapper: 'centeredFullscreen',
		rqDevtools: true,
	},
	render: (args) => (
		<div style={{ minWidth: '600px' }}>
			<StateWrapper {...args} />
		</div>
	),
} as Meta<typeof SearchBoxComp>

type StoryDef = StoryObj<typeof SearchBoxComp>
export const ByLocation = {
	args: {
		type: 'location',
	},
	// render: (args) => <StateWrapper {...args} />,
} satisfies StoryDef

export const ByOrganization = {
	args: {
		type: 'organization',
	},
	// render: (args) => <StateWrapper {...args} />,
} satisfies StoryDef
