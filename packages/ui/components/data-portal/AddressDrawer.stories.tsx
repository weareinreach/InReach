import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { fieldOpt } from '~ui/mockData/fieldOpt'
import { geo } from '~ui/mockData/geo'
import { location } from '~ui/mockData/location'
import { organization } from '~ui/mockData/organization'
import { service } from '~ui/mockData/service'

import { AddressDrawer } from './AddressDrawer'

export default {
	title: 'Data Portal/Drawers/Address',
	component: AddressDrawer,
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
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			fieldOpt.govDistsByCountryNoSub,
			organization.getIdFromSlug,
			service.getNames,
			location.getAddress,
			getTRPCMock({
				path: ['location', 'update'],
				type: 'mutation',
				response: { id: 'oloc_00000RECORD22ID' },
			}),
		],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof AddressDrawer>

type StoryDef = StoryObj<typeof AddressDrawer>

export const WithData = {
	args: {
		locationId: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	},
} satisfies StoryDef
export const WithoutData = {} satisfies StoryDef
