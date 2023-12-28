import { type Meta, type StoryObj } from '@storybook/react'

import { StorybookGridDouble } from '~ui/layouts'
import { service } from '~ui/mockData/service'

import { ServicesInfoCard } from './ServicesInfo'

export default {
	title: 'Sections/Services Info',
	component: ServicesInfoCard,
	args: {
		parentId: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
	},
	argTypes: {
		hideRemoteBadges: { control: 'boolean' },
	},
	parameters: {
		layout: 'fullscreen',
		nextjs: {
			router: {
				pathname: '/org/[slug]',
				asPath: '/org/mockOrg',
				query: {
					slug: 'mockOrg',
				},
			},
		},
		msw: [service.forServiceInfoCard, service.getParentName, service.byId],
		rqDevtools: true,
	},
	decorators: [StorybookGridDouble],
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
