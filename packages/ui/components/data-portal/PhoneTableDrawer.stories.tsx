import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from '~ui/components/core/Button'
import { organization } from '~ui/mockData/organization'
import { location } from '~ui/mockData/orgLocation'
import { orgPhone } from '~ui/mockData/orgPhone'
import { service } from '~ui/mockData/orgService'
import { phoneEmailFieldMocks } from '~ui/modals/dataPortal/PhoneEmail/fields.stories'

import { PhoneTableDrawer } from './PhoneTableDrawer'

export default {
	title: 'Data Portal/Drawers/Phone Number Table',
	component: PhoneTableDrawer,
	parameters: {
		layout: 'fullscreen',
		// layoutWrapper: 'centeredHalf',
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
			orgPhone.get,
			orgPhone.upsertMany,
			organization.getIdFromSlug,
			service.getNames,
			location.getNames,
			...phoneEmailFieldMocks,
		],
	},
	args: {
		component: Button,
		children: 'Open Drawer',
		variant: 'inlineInvertedUtil1',
	},
} satisfies Meta<typeof PhoneTableDrawer>

type StoryDef = StoryObj<typeof PhoneTableDrawer>

export const Default = {} satisfies StoryDef
