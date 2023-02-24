import { Meta } from '@storybook/react'
import React from 'react'

import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { mockSearch } from '~ui/mockData/orgSearch'

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
				response: (input) => mockSearch(input),
			}),
		],
	},
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
