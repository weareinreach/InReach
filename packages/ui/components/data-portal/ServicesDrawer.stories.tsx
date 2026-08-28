import { type Meta, type StoryObj } from '@storybook/nextjs'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { service } from '~ui/mockData/service'

import { ServicesDrawer } from './ServicesDrawer'

export default {
	title: 'Data Portal/Drawers/Services',
	component: ServicesDrawer,

	beforeEach({ msw }) {
		msw.use(organization.getIdFromSlug, service.getNames, service.forServiceDrawer)
	},

	parameters: {
		layout: 'fullscreen',
		rqDevtools: true,

		nextjs: {
			router: {
				pathname: '/org/[slug]/edit',
				asPath: '/org/mock-org-slug',
				query: {
					slug: 'mock-org-slug',
				},
			},
		},
	},

	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'primary',
	},
} satisfies Meta<typeof ServicesDrawer>

type StoryDef = StoryObj<typeof ServicesDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
