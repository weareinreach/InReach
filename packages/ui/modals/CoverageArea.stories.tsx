import { Meta } from '@storybook/react'

import { Button } from '~ui/components/core'

import { CoverageArea } from './CoverageArea'

export default {
	title: 'Modals/CoverageArea',
	component: CoverageArea,
	parameters: {
		design: {
			type: 'figma',
			url: 'https://www.figma.com/file/449Snk9R17VyIlRWH4c42F/%5BWIP%5D-New-Data-Portal-Layout?node-id=297-14609&t=HvZfDZuyjMWWu5Nl-0',
		},
		layout: 'fullscreen',
		layoutWrapper: 'centeredHalf',
	},
	args: {
		component: Button,
		children: 'Open Modal',
		orgName: 'test',
		orgLocations: ['State - CA', 'County - CA / San Francisco', 'City - CA / San Francisco'],
	},
} satisfies Meta<typeof CoverageArea>

export const Modal = {}
