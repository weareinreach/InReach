import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { component } from '~ui/mockData/component'
import { allFieldOptHandlers } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'
import { orgHours } from '~ui/mockData/orgHours'
import { service } from '~ui/mockData/service'

import { ServiceEditDrawer } from './index'

export default {
	title: 'Data Portal/Drawers/Service Edit',
	component: ServiceEditDrawer,
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
		msw: [
			organization.getIdFromSlug,
			service.getNames,
			service.forServiceEditDrawer,
			service.getOptions,
			component.ServiceSelect,
			orgHours.forHoursDisplay,
			...allFieldOptHandlers,
		],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ServiceEditDrawer>

type StoryDef = StoryObj<typeof ServiceEditDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
