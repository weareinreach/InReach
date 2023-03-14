import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { locationMock } from '~ui/mockData/locationCard'

import { VisitCard } from './VisitCard'

export default {
	title: 'Sections/Visit Info',
	component: VisitCard,
	args: {
		location: locationMock,
	},
	decorators: [StorybookGridSingle],
	parameters: {
		layout: 'fullscreen',
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
