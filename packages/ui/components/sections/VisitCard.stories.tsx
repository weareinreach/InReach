import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { location } from '~ui/mockData/location'

import { VisitCard } from './VisitCard'

export default {
	title: 'Sections/Visit Info',
	component: VisitCard,
	args: {
		locationId: 'locationId',
		published: true,
	},
	decorators: [StorybookGridSingle],
	parameters: {
		layout: 'fullscreen',
		msw: [location.forVisitCard],
	},
} satisfies Meta<typeof VisitCard>

type StoryDef = StoryObj<typeof VisitCard>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef

// export const Remote = {} satisfies StoryDef

// export const RemoteWithPhysicalAddress = {

// } satisfies StoryDef
