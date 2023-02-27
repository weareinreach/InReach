import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts'
import { locationMock } from '~ui/mockData/locationCard'

import { LocationCard } from './LocationCard'

export default {
	title: 'Sections/Location Info',
	component: LocationCard,
	args: {
		location: locationMock,
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof LocationCard>

type StoryDef = StoryObj<typeof LocationCard>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
