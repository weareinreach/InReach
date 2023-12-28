import { type Meta, type StoryObj } from '@storybook/react'
import { type ComponentProps, useState } from 'react'
import { type SetOptional } from 'type-fest'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

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
		msw: [organization.searchName, geo.autocompleteSearchBox, geo.geocodeSearchBox],
		layoutWrapper: 'centeredFullscreen',
		rqDevtools: true,
	},
	render: (args) => (
		<div style={{ minWidth: '600px' }}>
			<StateWrapper {...args} />
		</div>
	),
} satisfies Meta<typeof SearchBoxComp>

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
