import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { locationMock } from '~ui/mockData/locationCard'

import { VisitCard } from './VisitCard'

const remote = {
	attribute: {
		id: 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M',
		_count: {
			children: 0,
			parents: 0,
		},
		tsKey: 'additional.offers-remote-services',
		tsNs: 'attribute',
		icon: 'carbon:globe',
		iconBg: null,
		showOnLocation: null,
		categories: [
			{
				category: {
					tag: 'additional-information',
					icon: null,
				},
			},
		],
	},
	supplement: [],
}

export default {
	title: 'Sections/Visit Info',
	component: VisitCard,
	args: {
		location: locationMock,
		published: true,
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

export const Remote = {
	args: {
		location: {
			...locationMock,
			country: {},
			govDist: {},
			attributes: [remote],
		},
	},
}

export const RemoteWithPhysicalAddress = {
	args: {
		location: {
			...locationMock,
			attributes: [remote],
		},
	},
} satisfies StoryDef
