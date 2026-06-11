import { type Meta, type StoryObj } from '@storybook/react'
import { type ComponentProps, useState } from 'react'
import { type SetOptional } from 'type-fest'

import { geo } from '~ui/mockData/geo'
import { organization } from '~ui/mockData/organization'

import { SearchBox as SearchBoxComp } from './SearchBox'

const StateWrapper = (args: SetOptional<ComponentProps<typeof SearchBoxComp>, 'loadingManager'>) => {
	const [loading, setLoading] = useState(false)
	const loadingManager = { isLoading: loading, setLoading }
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

/**
 * SMART SEARCH SCENARIOS These stories test the 'searchName' handler's ability to handle typos, synonyms,
 * punctuation, and acronyms via PostgreSQL extensions.
 */

export const SmartSearchTypo = {
	name: 'Smart Search: Typo (Edit Distance)',
	args: {
		type: 'organization',
		initialValue: 'St Louis Queer+ Support Helplien',
	},
} satisfies StoryDef

export const SmartSearchSynonym = {
	name: 'Smart Search: Synonym Expansion',
	args: {
		type: 'organization',
		initialValue: 'Saint Louis Queer',
	},
} satisfies StoryDef

export const SmartSearchAcronym = {
	name: 'Smart Search: Acronym Match',
	args: {
		type: 'organization',
		initialValue: 'SQSH',
	},
} satisfies StoryDef

export const SmartSearchPunctuation = {
	name: 'Smart Search: Punctuation resilience',
	args: {
		type: 'organization',
		initialValue: 'St-Louis Queer & Support',
	},
} satisfies StoryDef

export const SmartSearchPartial = {
	name: 'Smart Search: Partial Phrase',
	args: {
		type: 'organization',
		initialValue: 'Queer Support Helpline',
	},
} satisfies StoryDef

export const SmartSearchSemantic = {
	name: 'Smart Search: Semantic Variation',
	args: {
		type: 'organization',
		initialValue: 'LGBTQ+',
	},
} satisfies StoryDef

export const ByOrganization = {
	args: {
		type: 'organization',
	},
	// render: (args) => <StateWrapper {...args} />,
} satisfies StoryDef

export const SmartSearchQueerPlus = {
	name: 'Smart Search: Queer+ (Single Word)',
	args: {
		type: 'organization',
		initialValue: 'Queer+',
	},
} satisfies StoryDef
