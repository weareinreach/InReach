import { Meta } from '@storybook/react'
import React from 'react'

import { SearchBox as SearchBoxComp } from './SearchBox'

export default {
	title: 'Design System/Search Box',
	component: SearchBoxComp,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/gl8ppgnhpSq1Dr7Daohk55/Design-System-(2023)?node-id=51%3A493&t=AVaWASBVFglQPwtW-0',
		},
	},
} as Meta<typeof SearchBoxComp>

export const SearchBoxLocation = {
	args: {
		type: 'location',
	},
}

export const SearchBoxOrganization = {
	args: {
		type: 'organization',
	},
}
