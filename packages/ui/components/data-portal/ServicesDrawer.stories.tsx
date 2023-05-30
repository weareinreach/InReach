import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { organization } from '~ui/mockData/organization'
import { service } from '~ui/mockData/orgService'

import { ServicesDrawer } from './ServicesDrawer'

export default {
	title: 'Data Portal/Drawers/Services',
	component: ServicesDrawer,
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
		msw: [organization.getIdFromSlug, service.getNames, service.forServiceDrawer],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof ServicesDrawer>

type StoryDef = StoryObj<typeof ServicesDrawer>

export const Default = {} satisfies StoryDef
// export const WithoutData = {} satisfies StoryDef
