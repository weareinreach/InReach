import { Meta, StoryObj } from '@storybook/react'

import { StorybookGrid } from '~ui/layouts'
import { servicesMock } from '~ui/mockData/servicesInfoCard'

import { ServicesInfoCard } from './ServicesInfo'

export default {
	title: 'Sections/Services Info',
	component: ServicesInfoCard,
	args: {
		services: servicesMock,
	},
	decorators: [StorybookGrid],
} satisfies Meta<typeof ServicesInfoCard>

type StoryDef = StoryObj<typeof ServicesInfoCard>
export const Desktop = {} satisfies StoryDef

export const Mobile = {
	parameters: {
		viewport: {
			defaultViewport: 'iphonex',
		},
	},
} satisfies StoryDef
