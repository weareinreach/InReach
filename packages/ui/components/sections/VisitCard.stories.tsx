import { Meta, StoryObj } from '@storybook/react'

import { StorybookGridSingle } from '~ui/layouts'
import { locationMock } from '~ui/mockData/locationCard'

import { VisitCard } from './VisitCard'

const remote = {
	attribute: {
		tsKey: 'additional.offers-remote-services',
		tsNs: 'attribute',
		icon: null,
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
