import { type Meta, type StoryObj } from '@storybook/nextjs'

import { fieldOpt } from '~ui/mockData/fieldOpt'
import { geo } from '~ui/mockData/geo'
import { location } from '~ui/mockData/location'

import { LocationDrawer } from './index'

const meta = {
	title: 'Data Portal/Drawers/Create Location',
	component: LocationDrawer,

	beforeEach({ msw }) {
		msw.use(
			geo.autocompleteFullAddress,
			geo.geocodeFullAddress,
			fieldOpt.govDistsByCountryNoSub,
			location.create
		)
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

		wdyr: true,
	},
} satisfies Meta<typeof LocationDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
