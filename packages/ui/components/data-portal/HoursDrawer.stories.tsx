import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { geoMocks } from '~ui/mockData/geo'
import { location } from '~ui/mockData/location'
import { organization } from '~ui/mockData/organization'
import { orgHours } from '~ui/mockData/orgHours'
import { service } from '~ui/mockData/orgService'

import { HoursDrawer } from './HoursDrawer'

export default {
	title: 'Data Portal/Drawers/Hours',
	component: HoursDrawer,
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
			geoMocks.autocomplete,
			geoMocks.geocodeFullAddress,
			fieldOpt.govDistsByCountryNoSub,
			organization.getIdFromSlug,
			service.getNames,
			location.getAddress,
			getTRPCMock({
				path: ['location', 'update'],
				type: 'mutation',
				response: { id: 'oloc_00000RECORD22ID' },
			}),
			orgHours.forHoursDrawer,
		],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof HoursDrawer>

type StoryDef = StoryObj<typeof HoursDrawer>

export const WithData = {
	args: {
		locationId: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	},
} satisfies StoryDef
export const WithoutData = {} satisfies StoryDef
